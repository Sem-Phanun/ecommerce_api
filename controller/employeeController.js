import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import connect from '../config/db.js'
import { getPermission } from "../helper/permission.js"
import { validation } from "../helper/services.js"
dotenv.config();

export const getAllEmployeeList = async (req, res) => {
  const sql =
    "SELECT first_name AS FirstName, last_name AS LastName FROM employee";
  const list = await connect.query(sql);
  res.json({
    list: list,
  });
};
export const getSingleEmployee = async (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE employee_id = ? ";
  const list = await connect.query(sql, [id]);
  res.json({
    list: list,
  });
};
export const employeeRegisterInfo = async (req, res) => {
  const { roleId, firstName, lastName, email, password, tel, address } =
    req.body;
  var msg = {};
  if (validation(firstName)) {
    msg.firstName = "First Name is required!";
  }
  if (validation(lastName)) {
    msg.lastName = "Last Name is required!";
  }
  if (validation(email)) {
    msg.email = "Email is required!";
  }
  if (Object.keys(msg).length > 0) {
    res.json({
      error: true,
      msg: msg,
    });
    return false;
  }
  const existAdminQuery = "SELECT employee_id FROM employee WHERE email = ? ";
  const existAdmin = await connect.query(existAdminQuery,[email]);
  if(existAdmin.length > 0){
    res.json({
      error: true,
      msg: "Account Already exist."
    })
    return false;
  }
  const sql =
    "INSERT INTO employee (role_id, first_name, last_name, email, tel, password, address)" +
    "VALUES(?, ?, ?, ?, ?, ?, ?)";
  const paramSql = [roleId, firstName, lastName, email, tel, password, address];
  const list = await connect.query(sql, paramSql);
  res.json({
    message: "Admin Account Create success.",
    list: list,
  });
};

export const login = async (req, res) => {
  var { email, password } = req.body;
  var msg = {};
  if (validation(email)) {
    msg.email = "Please fill email";
  }
  if (validation(password)) {
    msg.password = "Please fill password";
  }
  if (Object.keys(msg).length > 0) {
    res.json({
      error: true,
      msg: msg,
    });
    return false;
  }
  const sql = "SELECT * FROM employee WHERE email = ?";
  var user = await connect.query(sql, [email]);
  if (user.length > 0) {
    var passwordCompare = user[0].password; // get password from DB
    var isCorrect = bcrypt.compareSync(password, passwordCompare);
    if (isCorrect) {
      var user = user[0];
      delete user.password;
      var permission = await getPermission(user.staff_id);
      var obj = {
        user: user,
        permission: permission,
      };
      var access_token = jwt.sign(
        { data: { ...obj } },
        process.env.ACCESS_TOKEN,
        { expiresIn: "7d" }
      );
      var refresh_token = jwt.sign(
        { data: { ...obj } },
        process.env.REFRESH_TOKEN
      );
      res.json({
        ...obj,
        access_token: access_token,
        refresh_token: refresh_token,
      });
    } else {
      res.json({
        msg: "Password incorrect!",
        error: true,
      });
    }
  } else {
    res.json({
      msg: "Account does't exist!. Please goto register",
      error: true,
    });
  }
};

//refresh_token
export const refreshToken = async (req, res) => {
  var { refreshToken } = req.body;
  if (validation(refreshToken)) {
    res.status(401).json({
      message: "Unauthorized!",
    });
  } else {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (error, result) => {
        if (error) {
          res.status(401).json({
            message: "Unauthorized!",
            error: error,
          });
        } else {
          var email = result.data.user.email;
          var user = await connect.query("SELECT * FROM employee WHERE email = ?", [
            email,
          ]);
          user = user[0];
          delete user.password;
          var permission = await getPermission(user.employee_id);
          var obj = {
            user: user,
            permission: permission,
          };
          var access_token = jwt.sign(
            { data: { ...obj } },
            process.env.ACCESS_TOKEN,
            { expiresIn: "7d" }
          );
          var refresh_token = jwt.sign(
            { data: { ...obj } },
            process.env.REFRESH_TOKEN
          );
          res.json({
            ...obj,
            access_token: access_token,
            refresh_token: refresh_token,
          });
          res.json({
            refresh_token: result,
          });
        }
      }
    );
  }
};

export const setPassword = async (req, res) => {
  const { email, password } = req.body;
  var msg = {};
  if (validation(email)) {
    msg.email = "Please fill email";
  }
  if (validation(password)) {
    msg.password = "Please fill password";
  }
  if (Object.keys(msg).length > 0) {
    res.json({
      error: true,
      msg: msg,
    });
    return;
  }
  const emp = "SELECT * FROM employee WHERE email = ?";
  const list = await connect.query(emp, [email]);
  if (list.length > 0) {
    var passwordGenerate = bcrypt.hashSync(password, 10);
    var update = await connect.query(
      "UPDATE tbl_staff SET password = ? WHERE email = ?",
      [passwordGenerate, email]
    );
    res.json({
      msg: "Password upated",
      data: update,
    });
  } else {
    res.json({
      msg: "Account does't exist!. Please goto register!",
      error: true,
    });
  }
};
export const updateEmployeeInfo = async (req, res) => {
  const { empId, firstName, lastName, email, tel, password, address } =
    req.body;
  var msg = {};
  if (validation(empId)) {
    msg.staffId = "Staff id is required!";
  }
  if (validation(firstName)) {
    msg.firstName = "First Name is required!";
  }
  if (validation(lastName)) {
    msg.lastName = "Last Name is required!";
  }
  if (validation(email)) {
    msg.email = "Email is required!";
  }
  if (Object.keys(msg).length > 0) {
    res.json({
      error: true,
      msg: msg,
    });
    return false;
  }
  var sql =
    "UPDATE employee " +
    " SET first_name =? , last_name = ?, email =?, tel = ?, password = ?, address = ? WHERE staff_id =?";
  const employeeParam = [
    firstName,
    lastName,
    email,
    tel,
    password,
    address,
    staffId,
  ];
  const data = await connect.query(sql, employeeParam);
  res.json({
    data: data,
  });
};
export const deleteEmployeeInfo = async (req, res) => {
  var { id } = req.params;
  var sql = "DELETE FROM employee WHERE employee_id =? ";
  const data = await connect.query(sql, [id]);
  res.json({
    data: data,
  });
};

