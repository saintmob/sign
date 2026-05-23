import { createCheckin, deleteCheckinById, listCheckins, sendApiError } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      res.status(200).json(await listCheckins());
    } catch (error) {
      sendApiError(res, error);
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const entry = await createCheckin(req.body);
      res.status(201).json(entry);
    } catch (error) {
      sendApiError(res, error);
    }
    return;
  }

  if (req.method === "DELETE") {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
      res.status(200).json(await deleteCheckinById(id || ""));
    } catch (error) {
      sendApiError(res, error);
    }
    return;
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  res.status(405).json({ error: "Method not allowed" });
}

