-- (1) Creating a table to store To-Do list information
CREATE TABLE todo_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES member(id) ON DELETE SET NULL
);

-- (2) Allow authenticated users to SELECT, UpDate, Delete data
ALTER TABLE todo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users based on user_id"
ON todo
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Enable insert for authenticated users only"
ON todo
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id"
ON todo
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Enable delete for users based on user_id"
ON todo
FOR DELETE
USING (created_by = auth.uid());

-- (3) Administrators have access to all data,
CREATE POLICY "Allow full access for admin"
ON todo
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM permission
        WHERE permission.member_id = auth.uid()
        AND permission.role = 'admin'
    )
);

-- (4) normal users can only view data they have created
CREATE POLICY "Allow access to own todos"
ON todo
FOR SELECT
USING (created_by = auth.uid());

-- (5) SearchTodo Function
CREATE OR REPLACE FUNCTION search_todos(
  query TEXT DEFAULT NULL,
  completed_filter BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  completed BOOLEAN,
  created_at DATE,
  created_by UUID,
  title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.completed,
    t.created_at,
    t.created_by,
    t.title
  FROM todo t
  WHERE 
    (query IS NULL OR t.title ILIKE '%' || query || '%') -- whether title contains a string or not
    AND 
    (completed_filter IS NULL OR t.completed = completed_filter); -- completed state filtering
END;
$$ LANGUAGE plpgsql;