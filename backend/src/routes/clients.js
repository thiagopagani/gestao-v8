const express = require('express');
const { Client } = require('../models');

// Generic CRUD factory
const createCrudRoutes = (Model) => {
    const router = express.Router();
    router.get('/', async (req, res) => res.json(await Model.findAll()));
    router.get('/:id', async (req, res) => res.json(await Model.findByPk(req.params.id)));
    router.post('/', async (req, res) => res.status(201).json(await Model.create(req.body)));
    router.put('/:id', async (req, res) => {
        await Model.update(req.body, { where: { id: req.params.id } });
        res.json(await Model.findByPk(req.params.id));
    });
    router.delete('/:id', async (req, res) => {
        await Model.destroy({ where: { id: req.params.id } });
        res.status(204).send();
    });
    return router;
};

module.exports = createCrudRoutes(Client);
