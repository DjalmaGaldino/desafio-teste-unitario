import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from "uuid";
import request from "supertest"
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate with wrong password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "wrong password",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with wrong email", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "testingWithWrong@email.com.br",
      password: "admin",
    });

    expect(response.status).toBe(401);
  });
});
