// no spam protection btw

import type { VercelRequest, VercelRequestQuery, VercelResponse } from '@vercel/node';

import { PrismaClient } from '@prisma/client';
 
const prisma = new PrismaClient();

const vercelQueryParamSlop = (params: VercelRequestQuery[string]) => typeof params == 'object' ? params.join(',') : params;

export default async (request: VercelRequest, response: VercelResponse) => {
    if(!request.method) return response.status(400);

    switch(request.method) {
        case 'GET':
            const count = Math.min(parseInt(vercelQueryParamSlop(request.query['count'])) || 5, 25); // i hate this

            return response.json(
                await prisma.comments.findMany({
                    take: count,
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            );
        case 'POST':
            let body = request.body;

            try {
                JSON.stringify(body);
            } catch {
                return response.status(400).end('Body is not valid json!');
            }

            if(body['twitter_handle'] && (typeof body['twitter_handle'] != 'string' || !/^@?(\w){1,15}$/.test(body['twitter_handle'])))
                return response.status(400).end('Invalid twitter handle');

            if(!body['content'] || typeof body['content'] != 'string')
                return response.status(400).end('Invalid content!');

            const { twitter_handle, content } = body;

            await prisma.comments.create({ data: { twitter_handle, content } });
        
            return response.end();    
        default:
            return response.status(400).end('Unsupported method');
    }
}