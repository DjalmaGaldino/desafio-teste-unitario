import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement"
import { CreateStatementError } from "./CreateStatementError";


let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;


describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit statement", async () => {
    const user = await usersRepository.create({
      email: "testing@test.com",
      name: "test",
      password: "1234",
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await usersRepository.create({
      email: "testing@test.com",
      name: "test",
      password: "1234",
    });

    await createStatementUseCase.execute({
      amount: 101,
      description: "test",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to create a withdraw statement with funds", async () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "test@test.com",
        name: "test",
        password: "1234",
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create a statement with a non-existent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "test",
        type: OperationType.WITHDRAW,
        user_id: "non-existent",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
