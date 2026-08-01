const Employee = require("../models/employeeModel");

const isValidSalary = (salary) =>
  typeof salary === "number" && Number.isFinite(salary) && salary >= 0;

exports.createEmployee = async (req, res, next) => {
  try {
    const { name, position, salary } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof position !== "string" ||
      !position.trim() ||
      salary === undefined
    ) {
      return res.status(400).json({ message: "Name, position, and salary are required" });
    }

    if (!isValidSalary(salary)) {
      return res.status(400).json({ message: "Salary must be a non-negative number" });
    }

    const employee = await Employee.create({
      name: name.trim(),
      position: position.trim(),
      salary,
    });
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const allowedFields = ["name", "position", "salary"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    if (updates.salary !== undefined && !isValidSalary(updates.salary)) {
      return res.status(400).json({ message: "Salary must be a non-negative number" });
    }

    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return res.status(400).json({ message: "Name must be a non-empty string" });
      }
      updates.name = updates.name.trim();
    }

    if (updates.position !== undefined) {
      if (typeof updates.position !== "string" || !updates.position.trim()) {
        return res.status(400).json({ message: "Position must be a non-empty string" });
      }
      updates.position = updates.position.trim();
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
};
