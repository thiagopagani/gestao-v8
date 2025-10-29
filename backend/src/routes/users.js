const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Generic CRUD for a model
const createCrudRoutes = (Model) => {
    const router = express.Router();

    // Get all
    router.get('/', async (req, res) => {
        try {
            const items = await Model.findAll({ attributes: { exclude: ['password'] } });
            res.json(items);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Get one
    router.get('/:id', async (req, res) => {
        try {
            const item = await Model.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
            if (!item) return res.status(404).json({ error: 'Item not found' });
            res.json(item);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Create
    router.post('/', async (req, res) => {
        try {
            // Special handling for User password
            if (Model.name === 'User' && req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password || '123456', salt); // Default password if not provided
            }
             if (Model.name === 'User' && !req.body.password) {
                 const salt = await bcrypt.genSalt(10);
                 req.body.password = await bcrypt.hash('123456', salt);
             }
            const newItem = await Model.create(req.body);
            const { password, ...result } = newItem.toJSON();
            res.status(201).json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // Update
    router.put('/:id', async (req, res) => {
        try {
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Item not found' });
            
            // Do not allow password to be updated this way
            if (req.body.password) {
                delete req.body.password;
            }

            await item.update(req.body);
            const { password, ...result } = item.toJSON();
            res.json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    // Delete
    router.delete('/:id', async (req, res) => {
        try {
            const item = await Model.findByPk(req.params.id);
            if (!item) return res.status(404).json({ error: 'Item not found' });
            await item.destroy();
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};

module.exports = createCrudRoutes(User);
