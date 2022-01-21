const Product = Parse.Object.extend("Product");

Parse.Cloud.define("hello", (request) => {
  const name = request.params.name;
	return("Hello world from " + name + " from CloudCode");
});

Parse.Cloud.define("create-product", async (request) => {
  const stock = request.params.stock;
  if (stock == null || stock > 999) throw "invalid lenght";

  const product = new Product();
  product.set("name", request.params.name);
  product.set("price", request.params.price);
  product.set("stock", request.params.stock);
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
  const product = await query.get(request.params.productId, {useMasterKey: true});
  const json = product.toJSON();
  return {
    name: json.name,
    price: json.price,
    stock: json.stock
  };
});

Parse.Cloud.define("list-products", async (request) => {
  const page = request.params.page;
  const query = new Parse.Query(Product);
  // query.equalTo("isSelling", true);
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
