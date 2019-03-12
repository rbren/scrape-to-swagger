declare -a arr=("confluence" "github" "product-hunt" "libraries.io" "ups" "reddit")

for name in "${arr[@]}"
do
  echo "Scraping $name"
  node index.js --config ./config/$name.js --output ./output/$name.swagger.json
  ./node_modules/swagger-cli/bin/swagger-cli.js validate ./output/$name.swagger.json
done


