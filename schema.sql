-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS delete_quiz_with_scores(UUID);
DROP FUNCTION IF EXISTS clear_quiz_scores(UUID);
DROP FUNCTION IF EXISTS get_player_stats(TEXT);
DROP FUNCTION IF EXISTS get_global_leaderboard();

-- Create function to get global leaderboard with proper score aggregation
CREATE OR REPLACE FUNCTION get_global_leaderboard()
RETURNS TABLE (
  name TEXT,
  is_team BOOLEAN,
  team_members TEXT,
  total_score BIGINT,
  quizzes_played BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_scores AS (
    SELECT 
      u.id,
      u.name,
      u.is_team,
      u.team_members,
      COALESCE(SUM(s.score), 0) as total_score,
      COUNT(DISTINCT s.quiz_id) as quizzes_played
    FROM users u
    LEFT JOIN scores s ON u.id = s.user_id
    GROUP BY u.id, u.name, u.is_team, u.team_members
  )
  SELECT 
    us.name,
    us.is_team,
    us.team_members::text,
    us.total_score::bigint,
    us.quizzes_played::bigint
  FROM user_scores us
  WHERE us.quizzes_played > 0
  ORDER BY us.total_score DESC, us.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get player stats
CREATE OR REPLACE FUNCTION get_player_stats(player_name_param TEXT)
RETURNS TABLE (
  name TEXT,
  is_team BOOLEAN,
  team_members TEXT,
  total_score BIGINT,
  quizzes_played BIGINT,
  quiz_scores JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT 
      u.id,
      u.name,
      u.is_team,
      u.team_members,
      COALESCE(SUM(s.score), 0) as total_score,
      COUNT(DISTINCT s.quiz_id) as quizzes_played
    FROM users u
    LEFT JOIN scores s ON u.id = s.user_id
    WHERE LOWER(u.name) = LOWER(player_name_param)
    GROUP BY u.id, u.name, u.is_team, u.team_members
  ),
  quiz_scores AS (
    SELECT 
      s.quiz_id,
      q.title as quiz_title,
      s.score,
      RANK() OVER (PARTITION BY s.quiz_id ORDER BY s.score DESC) as rank
    FROM scores s
    JOIN quizzes q ON q.id = s.quiz_id
    JOIN users u ON u.id = s.user_id
    WHERE LOWER(u.name) = LOWER(player_name_param)
  )
  SELECT 
    ud.name,
    ud.is_team,
    ud.team_members::text,
    ud.total_score::bigint,
    ud.quizzes_played::bigint,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'quiz_id', qs.quiz_id,
          'quiz_title', qs.quiz_title,
          'score', qs.score,
          'rank', qs.rank
        )
      ) FILTER (WHERE qs.quiz_id IS NOT NULL),
      '[]'::jsonb
    ) as quiz_scores
  FROM user_data ud
  LEFT JOIN quiz_scores qs ON true
  GROUP BY ud.id, ud.name, ud.is_team, ud.team_members, ud.total_score, ud.quizzes_played;
END;
$$ LANGUAGE plpgsql;

-- Create function to clear quiz scores
CREATE OR REPLACE FUNCTION clear_quiz_scores(quiz_id_param UUID)
RETURNS void AS $$
BEGIN
  -- Delete all scores for the quiz
  DELETE FROM scores WHERE quiz_id = quiz_id_param;
  
  -- Reset participants count
  UPDATE quizzes 
  SET participants_count = 0,
      updated_at = NOW()
  WHERE id = quiz_id_param;
END;
$$ LANGUAGE plpgsql;