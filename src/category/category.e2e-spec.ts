import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { UsersModule } from 'src/users/users.module';
import { AppModule } from '../app.module';

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let categoryId: string;

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

  describe('/categories (POST)', () => {
    it('should create a new category', async () => {
      const createCategoryDto = { name: 'New Test category' } as CreateCategoryDto;

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createCategoryDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toHaveProperty('_id');
      categoryId = response.body._id;
    });

    it('should return a conflict if category name already exists', async () => {
      const createCategoryDto = { name: 'New Test category' } as CreateCategoryDto;

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createCategoryDto);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.message).toEqual('Category with name already exists');
    });
  });

  describe('/categories (GET)', () => {
    it('should fetch all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should search categories by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?search=New Test category')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body[0].name).toEqual('New Test category');
    });
  });

  describe('/categories/:categoryId (PUT)', () => {
    it('should update a category', async () => {
      const updateCategoryDto = { name: 'Updated Test Category' };

      const response = await request(app.getHttpServer())
        .put(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCategoryDto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.name).toEqual('Updated Test Category');
    });
  });

  describe('/categories/:categoryId (DELETE)', () => {
    it('should delete a category', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
    });
  });
});
