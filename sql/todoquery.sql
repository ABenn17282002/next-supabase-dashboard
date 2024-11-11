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
