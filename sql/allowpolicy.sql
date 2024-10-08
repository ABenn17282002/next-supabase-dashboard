-- ※ A2024/10/01, it is necessary to register the email domain in order to log in with the registered email address.
--(1) Allow only users with 'admin' role to insert data
CREATE POLICY "Allow admin insert"
ON member
FOR INSERT
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Allow admin access"
ON permission
FOR INSERT
WITH CHECK (auth.role() = 'admin');

-- (2) Allow authenticated users to SELECT data
CREATE POLICY "Allow all users to select from member"
ON member
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Allow all users to select permission data"
ON permission
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = member_id OR is_admin(auth.uid()));

-- (3) is_adimin function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM permission 
        WHERE member_id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql;

-- (4) Allow admins to delete members
CREATE POLICY "allow admin to delete member"
ON member
FOR DELETE
USING (
  is_admin(auth.uid())
);

CREATE POLICY "allow admin to delete permission"
ON permission
FOR DELETE
USING (
  is_admin(auth.uid())
);


