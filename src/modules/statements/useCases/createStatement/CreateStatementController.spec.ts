import { v4 as uuid } from "uuid"
import { Connection } from "typeorm"
import { hash } from "bcryptjs";
import request from "supertest";
import { app } from "../../../../app";
import createConnection from "../../../../database";


let connection: Connection;

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  it("should be able to create a deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin"
    });

    const { token } = responseToken.body;

    const response = await request(app).post("/api/v1/statements/deposit").send({
      amount: 100,
      description: "Desposited to test"
    }).set({ Authorization: `Bearer ${token}` })

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(100);

    it("should not be able to create withdraw statement without funds", async () => {
      const responseToken = await request(app).post("/api/v1/sessions").send({
        email: "admin@finapi.com.br",
        password: "admin",
      });

      const { token } = responseToken.body;

      const response = await request(app).post("/api/v1/statements/withdraw").send({
          amount: 100,
          description: "Withdraw test",
        }).set({
          Authorization: `Bearer ${token}`,
        });

      expect(response.status).toBe(400);
    });

  })

})
