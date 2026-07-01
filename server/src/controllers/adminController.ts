import { Request, Response } from "express";
import {
  deleteEmployeePhotoByUrl,
  deleteEmployeeUploadedFile,
  getEmployeePhotoUrl,
} from "../middlewares/uploadEmployeePhoto";
import { employeeRepository } from "../repositories/employeeRepository";
import { isValidAdminCredentials } from "../utils/adminAuth";
import { parseEmployeeId } from "../utils/request";
import { sendError, sendSuccess } from "../utils/response";
import { validateEmployeeBody, validateLoginBody } from "../validators/employeeValidator";

export const authController = {
  login(req: Request, res: Response) {
    const validation = validateLoginBody(req.body);
    if (!validation.ok) {
      return sendError(res, validation.message, 400);
    }

    const { login, password } = validation.data;

    if (!isValidAdminCredentials(login, password)) {
      return sendError(res, "Неверный логин или пароль", 401);
    }

    sendSuccess(res, { ok: true });
  },
};

export const adminController = {
  async list(_req: Request, res: Response) {
    const employees = await employeeRepository.findAll();
    sendSuccess(
      res,
      employees.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        position: e.position,
        description: e.description,
        photoUrl: e.photoUrl,
        isActive: e.isActive,
        likes: e.votes.filter((v) => v.type === "LIKE").length,
        dislikes: e.votes.filter((v) => v.type === "DISLIKE").length,
      })),
    );
  },

  async create(req: Request, res: Response) {
    const validation = validateEmployeeBody(req.body);
    if (!validation.ok) {
      await deleteEmployeeUploadedFile(req.file);
      return sendError(res, validation.message, 400);
    }

    let employee;

    try {
      employee = await employeeRepository.create({
        fullName: validation.data.fullName,
        position: validation.data.position,
        description: validation.data.description ?? "",
        photoUrl: getEmployeePhotoUrl(req.file) ?? "",
      });
    } catch (err) {
      await deleteEmployeeUploadedFile(req.file);
      throw err;
    }

    sendSuccess(res, employee, 201);
  },

  async update(req: Request, res: Response) {
    const id = parseEmployeeId(req.params.id);
    if (!id) {
      await deleteEmployeeUploadedFile(req.file);
      return sendError(res, "Некорректный id сотрудника", 400);
    }

    const validation = validateEmployeeBody(req.body);
    if (!validation.ok) {
      await deleteEmployeeUploadedFile(req.file);
      return sendError(res, validation.message, 400);
    }

    const existing = await employeeRepository.findById(id);
    if (!existing) {
      await deleteEmployeeUploadedFile(req.file);
      return sendError(res, "Сотрудник не найден", 404);
    }

    const newPhotoUrl = getEmployeePhotoUrl(req.file);
    let employee;

    try {
      employee = await employeeRepository.update(id, {
        fullName: validation.data.fullName,
        position: validation.data.position,
        description: validation.data.description ?? "",
        photoUrl: newPhotoUrl ?? existing.photoUrl,
      });
    } catch (err) {
      await deleteEmployeeUploadedFile(req.file);
      throw err;
    }

    if (newPhotoUrl) {
      await deleteEmployeePhotoByUrl(existing.photoUrl);
    }

    sendSuccess(res, employee);
  },

  async remove(req: Request, res: Response) {
    const id = parseEmployeeId(req.params.id);
    if (!id) {
      return sendError(res, "Некорректный id сотрудника", 400);
    }

    const existing = await employeeRepository.findById(id);
    if (!existing) {
      return sendError(res, "Сотрудник не найден", 404);
    }

    await employeeRepository.delete(id);
    await deleteEmployeePhotoByUrl(existing.photoUrl);
    sendSuccess(res, { id });
  },
};
