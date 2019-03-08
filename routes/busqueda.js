var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//===============================================
// Busqueda por tabla
//===============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var regex = new RegExp(req.params.busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(req.params.busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(req.params.busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(req.params.busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
                error: { message: 'tipo de tabla/coleccion no valido' }
            });
    }
    promesa.then(respuestas => {
        res.status(200).json({
            ok: true,
            [tabla]: respuestas
        });
    });
});

//===============================================
// Busqueda General
//===============================================
app.get('/todo/:busqueda', (req, res, next) => {

    var regex = new RegExp(req.params.busqueda, 'i');

    Promise.all([
            buscarHospitales(req.params.busqueda, regex),
            buscarMedicos(req.params.busqueda, regex),
            buscarUsuarios(req.params.busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]

            });
        });
});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;