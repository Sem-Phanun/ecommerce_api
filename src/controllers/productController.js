const db = require("../config/db");
const {validation} = require("../helper/services");

const getAllProduct = async (req, res) => {
  const sql = "SELECT * FROM tbl_product";

  //join category panigation search
  const data = await db.query(sql);
  res.json({
    list: data,
  });
};
const getSingleProduct = async (req, res) => {
  const id = id.params.id;
  const sql = "SELECT * FROM tbl_product";
  const list = await db.query(sql, [id]);
  res.json({
    data: list,
  });
};
const createProduct = async (req, res) => {
  var { categoryId, barcode, productName, quantity, price, image, description } =
    req.body;
  var msg = {};
  if (validation(categoryId)) {
    msg.categoryId = "category ID is required!";
  }
  if (validation(barcode)) {
    msg.barcode = "Barcode is required!";
  }
  if (validation(productName)) {
    msg.productName = "Product name is required!";
  }
  if (validation(quantity)) {
    msg.quantity = "Quantity is required!";
  }
  if (validation(price)) {
    msg.price = "Price is required!";
  }
  if (Object.keys(msg).length > 0) {
    res.json({
      error: true,
      msg: msg,
    });
    return false;
  }

  const sql =
    "INSERT INTO tbl_product (category_id, barcode, product_name, quantity, price, image, description) VALUES(?, ?, ?, ?, ?, ?, ?)";
  const param = [
    categoryId,
    barcode,
    productName,
    quantity,
    price,
    image,
    description,
  ];
  const list = await db.query(sql, param);
  res.json({
    data: list,
  });
};
const updateProduct = async (req, res) => {
  var { categoryId, barcode, name, quantity, price, image, description } =
    req.body;
  var msg = {};
  if (validation(categoryId)) {
    msg.categoryId = "category ID is required!";
  }
  if (validation(barcode)) {
    msg.barcode = "Barcode is required!";
  }
  if (validation(name)) {
    msg.name = "Product name is required!";
  }
  if (validation(quantity)) {
    msg.quantity = "Quantity is required!";
  }
  if (validation(price)) {
    msg.price = "Price is required!";
  }
  if (Object.keys(msg).length > 0) {
    res.json({
      error: true,
      msg: msg,
    });
    return false;
  }

  const sql =
    "UPDATE tbl_product SET category_id =? , barcode =?, name =?, quantity =?, price =?, image =?, description =? WHERE product_id =?";
  const param = [
    category_id,
    barcode,
    name,
    quantity,
    price,
    image,
    description,
    product_id,
  ];
  const list = await db.query(sql, param);
  res.json({
    data: list,
    body: req.body,
    file: req.files 
  });
};
const removeProduct = async (req, res) => {
  const {id} = req.body
  var sql = "DELETE FROM tbl_product WHERE product_id = ?"
  const data = await db.query(sql,[id])
  res.json({
    msg: "Product is remove!",
    data: data
  });
};
const changeStatus = async (req, res) => {
  const {status} = req.body
  var sql = "UPDATE tbl_product SET status = ? WHERE product_id = ?"
  const list = await db.query(sql,[status])
  res.json({
    msg: "Status is "+ (status == 0 ? "inactive":"active"),
    list: list
  })
};
module.exports = {
  getAllProduct,
  getSingleProduct,
  createProduct,
  updateProduct,
  removeProduct,
  changeStatus,
};
