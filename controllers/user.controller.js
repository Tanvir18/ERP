// controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Render registration page
exports.registerPage = (req, res) => res.render('register');

// Register a new user
exports.registerUser = async (req, res) => {
    const { first_name, last_name, user_name, email, phone, user_role, is_active, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { first_name, last_name, user_name, email, phone, user_role, is_active, password: hashedPassword };

    db.query('INSERT INTO users SET ?', user, (err, results) => {
        if (err) throw err;
        res.redirect('/login');
    });
};

// Render login page
exports.loginPage = (req, res) => res.render('login');

// Handle user login
exports.loginUser = (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0 || !await bcrypt.compare(password, results[0].password)) {
            return res.send('Invalid credentials');
        }
        const user = results[0];
        const token = jwt.sign({ id: user.id, role: user.user_role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        req.session.token = token;
        res.redirect('/index');
    });
};

// Handle user logout
exports.logoutUser = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

// Render index page with logged in user
exports.indexPage = (req, res) => {
    // Extract the token from the session
    const token = req.session.token;

    if (!token) {
        return res.redirect('/login');  // Redirect to login if no token
    }

    // Verify and decode the JWT
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.redirect('/login');  // Redirect if JWT is invalid or expired
        }

        // The decoded user data is now available
        const { id } = user;

        // Query to fetch user details from the database using the decoded ID
        db.query('SELECT * FROM users WHERE id = ?', [id], (err, users) => {
            if (err) throw err;
            // Query to get the total number of users
            db.query('SELECT COUNT(*) AS total_users FROM users', (err, countResults) => {
                if (err) throw err;

            const totalUsers = countResults[0].total_users;
            // Render the 'index' page and pass the user data to the view
            res.render('index', { user: users[0],totalUsers: totalUsers });
            });
        });
    });
};



// Render index page with all users
exports.usersPage = (req, res) => {
    db.query('SELECT * FROM users', (err, users) => {
        if (err) throw err;
        res.render('users', { users });
    });
};

// Render add user page
exports.addUserPage = (req, res) => res.render('add-user');

// Add a new user
exports.addUser = (req, res) => {
    const { first_name, last_name, user_name, email, phone, user_role, is_active } = req.body;
    const password = bcrypt.hashSync(req.body.password, 10);
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    db.query('INSERT INTO users SET ?', { first_name, last_name, user_name, email, phone, user_role, is_active, photo, password }, (err) => {
        if (err) throw err;
        res.redirect('/users');
    });
};

// Render edit user page
exports.editUserPage = (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, users) => {
        if (err) throw err;
        res.render('edit-user', { user: users[0] });
    });
};

// Update an existing user
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, user_name, email, phone, user_role, is_active } = req.body;
    db.query('UPDATE users SET ? WHERE id = ?', [{ first_name, last_name, user_name, email, phone, user_role, is_active }, id], (err) => {
        if (err) throw err;
        res.redirect('/users');
    });
};

// Delete a user
exports.deleteUser = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/users');
    });
};


// controllers/userController.js
exports.userProfile = (req, res) => {
    const userId = req.params.id; // Assuming user ID is passed as a route parameter

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            return res.status(500).send('Error retrieving profile information');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        const user = results[0];
        res.render('profile', { user });
    });
};

// Render dummy page 1
exports.dummy1Page = (req, res) => {
    // You can pass data to the page if needed, here it's just a simple example
    res.render('SupplieReportPage', { message: 'Welcome to Dummy Page 1!' });
};

// Render dummy page 2
exports.dummy2Page = (req, res) => {
    // You can pass data to the page if needed, here it's just a simple example
    res.render('AddSuppliers', { message: 'Welcome to Dummy Page 2!' });
};