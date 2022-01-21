const Product = Parse.Object.extend("Product");
const Brand = Parse.Object.extend("Brand");

Parse.Cloud.define("hello", (request) => {
  const name = request.params.name;
	return("Hello world from " + name + " from CloudCode");
});

Parse.Cloud.define("create-product", async (request) => {
  // if (request.user == null) throw "User not authenticated";
  const stock = request.params.stock;
  if (stock == null || stock > 999) throw "invalid lenght";
  if (request.params.brandId == null) throw "invalid brand";

  const product = new Product();
  const brand = new Brand();
  brand.id = request.params.brandId;

  product.set("name", request.params.name);
  product.set("price", request.params.price);
  product.set("stock", request.params.stock);
  product.set("brand", brand);
  product.set("createdBy", request.user);
  product.set("isSelling", false);
  const savedProduct = await product.save(null, {useMasterKey: true});
  return savedProduct.id;
});

Parse.Cloud.define("change-price", async (request) => {
  if (request.params.productId == null) throw "Invalid product";
  if (request.params.price == null) throw "Price not informed";
  const product = new Product();
  product.id = request.params.productId;
  product.set("price", request.params.price);
  const savedProduct = await product.save(null, {useMasterKey: true});
  return savedProduct.get("price");
});

Parse.Cloud.define("delete-product", async (request) => {
  if (request.params.productId == null) throw "Invalid product";
  const product = new Product();
  product.id = request.params.productId;
  product.destroy({useMasterKey: true});
  return "Product deleted";
});

Parse.Cloud.define("get-product", async (request) => {
  if (request.params.productId == null) throw "Invalid product";
  const query = new Parse.Query(Product);
  query.include("brand");
  const product = await query.get(request.params.productId, {useMasterKey: true});
  // return product;
  const json = product.toJSON();
  return {
    name: json.name,
    price: json.price,
    stock: json.stock,
    brandName: json.brand != null ? json.brand.name : null,
  };
});

Parse.Cloud.define("list-products", async (request) => {
  const page = request.params.page;
  const query = new Parse.Query(Product);
  // query.equalTo("isSelling", true);
  // query.equalTo("createdBy", request.user);
  query.greaterThan("price", 100); // query.lessThan("price", 2000); //orEqualTo
  query.ascending("stock"); // descending
  query.limit(2);
  query.skip(page); // page * 2
  const products = await query.find({useMasterKey: true});
  return products.map(function(p){
    p = p.toJSON();
    return {
      name: p.name,
      price: p.price,
      stock: p.stock
    } 
  });
});

Parse.Cloud.define("sign-up", async (request) => {
  if (request.params.email == null) throw "Invalid email";
  if (request.params.password == null) throw "Invalid password";
  if (request.params.name == null) throw "Invalid name";

  const user = new Parse.User();
  user.set("username", request.params.email);
  user.set("email", request.params.email);
  user.set("password", request.params.password);
  user.set("name", request.params.name);
  user.set("city", request.params.city);

  const savedUser = await user.signUp(null, {useMasterKey: true});
  return savedUser.get("sessionToken");
});

Parse.Cloud.define("get-current-user", async (request) => {
  return request.user;
});

Parse.Cloud.define("login", async (request) => {
  const user = await Parse.User.logIn(request.params.email, request.params.password);
  return user;
});