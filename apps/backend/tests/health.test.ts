import request from "supertest";
import { app } from "./helpers/testServer";

describe("GET /health", () => {
  it("retourne 200 et status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
