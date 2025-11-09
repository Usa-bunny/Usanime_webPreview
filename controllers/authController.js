const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const authController = {
    getRegister: (req, res) => {
        res.render('register');
    },

    getLogin: (req, res) => {
        res.render('login');
    },

    register: async (req, res) => {
        try {
            const { nama, email, username, password } = req.body;

            const existingUser = await User.findOne({ "akun.username": username });
            if (existingUser) {
                return res.status(400).send('Username already exists');
            }

            const existingEmail = await User.findOne({ email: email });
            if (existingEmail) {
                return res.status(400).send('Email already registered');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                nama,
                email,
                akun: {
                    username,
                    password: hashedPassword,
                    role: 'user'
                }
            })

            await newUser.save();
            res.redirect('/auth/login');
        } catch (error) {
            console.error(error);
            res.status(500).send('registration failed');
        }
    },
    
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ "akun.username": username });
            if (!user) {
                return res.status(400).send('Invalid username');
            }

            const validPassword = await bcrypt.compare(password, user.akun.password);
            if (!validPassword) {
                return res.status(400).send('Invalid password');
            }

            req.session.user = {
                _id: user._id,
                username: user.akun.username,
                role: user.akun.role
            };


            if (user.akun.role === 'admin') {
                res.redirect('/anime/admin');
            } else {
                res.redirect('/anime');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('login failed');
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                res.status(500).send('logout failed');
            }
            res.redirect('/auth/login');
        });
    }
};

module.exports = authController;