import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import { conec } from '../database.js';
dotenv.config();

async function login(req, res) {
	console.log('--> request de LOGIN');
	//	-->	Recuperando informacion de la peticion
	const user = req.body.user;
	const password = req.body.password;
	const usuarioARevisar = users.find((usuario) => usuario.user_name === user);

	//	-->	Autenticacion
	if (!user || !password) {
		return res.status(400).send({ status: 'Error', message: 'Los campos están incompletos' });
	}

	if (!usuarioARevisar) {
		console.log(users);

		res.status(400).send({ status: 'Error', message: 'El usuario no existe' });
		return console.log('El usuario no existe');
	}

	const loginCorrecto = await bcryptjs.compare(password, usuarioARevisar.password);

	if (!loginCorrecto) {
		res.status(400).send({ status: 'Error', message: 'Datos incorrectos' });
		return console.log('Los datos del usuario son incorrectos');
	}

	// const token = jsonwebtoken.sign({ user: usuarioARevisar }, process.env.JWT_SECRET, {
	// 	expiresIn: process.env.JWT_EXPIRATION,
	// });

	//	--> Conexion a la base de datos
	const connection = await conec.getConnection();
	const users = await connection.query('SELECT * FROM register_users.users;');

	//	-->	Respuesta 'ok' al cliente
	res.status(200).send({ status: 'ok', message: 'Sesion iniciada correctamente', redirect: '/admin' });
	return console.log('sesion iniciada correctamente');
}

async function register(req, res) {
	console.log('--> peticion de registro.');
	//	-->	Recuperando informacion de la peticion
	const user = req.body.user;
	const email = req.body.email;
	const password = req.body.password;
	const usuarioARevisar = users.find((usuario) => usuario.user_name === user);

	if (!user || !email || !password) {
		return res.status(400).send({ status: 'Error', message: 'Los campos están incompletos!!!' });
	}

	if (usuarioARevisar) {
		res.status(400).send({ status: 'Error', message: 'El usuario ya existe!!!' });
		return console.log('El usuario ya existe');
	}

	const salt = await bcryptjs.genSalt(5);
	const hashPassword = await bcryptjs.hash(password, salt);

	const nuevoUsuario = {
		user: user,
		email: email,
		password: hashPassword,
	};

	//	-->	Conexion a la base de datos
	const connection = await conec.getConnection();

	const result = await connection.query(
		'INSERT INTO `register_users`.`users` (`user_name`, `email`, `password`) VALUES (?, ?, ?);',
		[user, email, hashPassword],
	);

	console.log(nuevoUsuario);
	console.log('Registrado correctamente');

	//	-->	Solicitan y mostrando en la consola todos los usuarios registrados en la base de datos
	const users = await connection.query('SELECT * FROM register_users.users;');
	console.log(users);

	//	-->	Respuesta 'ok' al cliente
	return res.status(201).send({ status: 'ok', message: `Usuario ${nuevoUsuario.user} agregado`, redirect: '/' });
}

export const methods = {
	login,
	register,
};