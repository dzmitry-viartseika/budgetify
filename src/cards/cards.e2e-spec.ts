import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CreateCardDto } from './dto/create-card.dto';
import { UsersModule } from '../users/users.module';
import * as process from 'node:process';

describe('CardsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdCardId: string;
  const testUserId: string = process.env.E2E_TEST_USER_ID;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email: process.env.E2E_TEST_USER, password: process.env.E2E_TEST_USER_PASSWORD });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/cards (POST) - Create Card', () => {
    it('should create a new card with required fields', async () => {
      const cardData: CreateCardDto = {
        title: 'Test Card',
        balance: 100,
        currency: 'USD',
        description: 'This is a test card description',
      };

      const response = await request(app.getHttpServer())
        .post('/cards')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(cardData);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('_id');

      createdCardId = response.body._id;
      expect(response.body.title).toEqual(cardData.title);
      expect(response.body.balance).toEqual(cardData.balance);
      expect(response.body.currency).toEqual(cardData.currency);
      expect(response.body.userId).toEqual(testUserId);
    });
  });

  describe('/cards (GET) - Get All Cards', () => {
    it('should return an array of cards for the user with balance and currency', async () => {
      const response = await request(app.getHttpServer())
        .get('/cards')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].balance).toBeDefined();
      expect(response.body[0].currency).toBeDefined();
    });
  });

  describe('/cards/:id (GET) - Get Card by ID', () => {
    it('should return a specific card by ID with balance and currency', async () => {
      const response = await request(app.getHttpServer())
        .get(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body._id).toEqual(createdCardId);
      expect(response.body.balance).toEqual(100);
      expect(response.body.currency).toEqual('USD');
      expect(response.body.userId).toEqual(testUserId);
    });
  });

  describe('/cards/:id (PATCH) - Update Card', () => {
    it('should update the card balance and currency successfully', async () => {
      const updateData = { balance: 200, currency: 'EUR' };

      const response = await request(app.getHttpServer())
        .put(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...updateData, userId: testUserId })
        .expect(HttpStatus.OK);

      expect(response.body.balance).toEqual(updateData.balance);
      expect(response.body.currency).toEqual(updateData.currency);
    });
  });

  describe('/cards/:id (DELETE) - Delete Card', () => {
    it('should delete the card successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/cards/${createdCardId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ userId: testUserId })
        .expect(HttpStatus.OK);
    });
  });
});
