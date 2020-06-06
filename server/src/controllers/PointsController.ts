import { Request, Response } from 'express';
import knex from '../database/connection';


class PointsController {

  async show(req: Request, res: Response) {
    const { id } = req.params;

    knex.transaction(async trx => {
      const point = await knex('points').transacting(trx)
        .where('id', id).first();

      const items = await knex('items').transacting(trx)
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id);

      const serializedPoints = {
          ...point,
          image_url: `http://192.168.25.4:3333/tmp/${point.image}`
      };

      return { point: serializedPoints, items };
    })
      .then(resp => {
        if (!resp.point) {
          return res.status(400).json({ message: 'Point not found.' });
        }
        return res.json({ ...resp });
      });
  }

  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.25.4:3333/tmp/${point.image}`
      };
    });

    return res.json(serializedPoints);
  }

  async create(req: Request, res: Response) {

    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
      image
    } = req.body;


    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    knex.transaction(async trx => {

      const insertedIds = await knex('points').transacting(trx).insert(point);

      const point_id = insertedIds[0];

      const pointItems = items
        .split(',')
        .map((item_id: string) => Number(item_id.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id
          };
        });

      await knex('point_items').transacting(trx).insert(pointItems);

      return point_id;

    })
      .then(point_id => res.json({ point_id, ...point }));

  }

}

export default PointsController;