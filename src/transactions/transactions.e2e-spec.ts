import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsModule } from './transactions.module';

const CREATE_TRANSACTION_DTO: CreateTransactionDto = {
  title: 'Netflix',
  payee: 'Landlord',
  categories: ['Housing', 'Rent'],
  amount: 500,
  type: 'Expense',
  paymentDate: new Date('2024-10-01T00:00:00.000Z'),
  description: 'October rent payment',
  files: [],
};

describe.only('TransactionController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TransactionsModule],
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

  describe('/transactions (POST)', () => {
    it('should create a new category', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(CREATE_TRANSACTION_DTO);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('_id');
      transactionId = response.body._id;
    });
  });

  describe('/transactions (GET)', () => {
    it('should receive transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions?page=1&limit=2&sortBy=paymentDate&sortOrder=asc')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data[0].title).toEqual('Netflix');
    });
  });

  describe('/transactions/:transactionId (PUT)', () => {
    it('should update a category', async () => {
      const response = await request(app.getHttpServer())
        .put(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...CREATE_TRANSACTION_DTO,
          title: 'Updated Title Netflix',
        });

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.title).toEqual('Updated Title Netflix');
    });
  });

  describe('/transactions/:transactionId (DELETE)', () => {
    it('should delete a category', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
    });
  });
});
