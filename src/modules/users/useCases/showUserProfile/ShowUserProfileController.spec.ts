import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import request from "supertest";
import { v4 as uuid } from "uuid";
import { app } from "../../../../app";


let connection: Connection

describe("Show User Profile Controller", () => {
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

  it("should be able to show the user profile", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/profile").send().set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("admin");
    expect(response.body.email).toBe("admin@finapi.com.br");
  });
});
