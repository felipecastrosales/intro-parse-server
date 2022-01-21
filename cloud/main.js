Parse.Cloud.define("hello", (request) => {
  const name = request.params.name;
	return("Hello world from " + name + " from CloudCode");
});