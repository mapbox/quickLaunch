const inquirer = require("inquirer");
const { exec } = require('child_process');
const fs = require("fs");

inquirer
  .prompt([{
      type: "input",
      name: "title",
      message: "What is your Dashboard name?"
    },
    {
      type: "input",
      name: "description",
      message: "Describe your dashboard use-case"
    },
    {
      type: "input",
      name: "favicon",
      message: "Favicon location"
    },
    {
      type: "input",
      name: "logo",
      message: "Input your logo image source"
    },
    {
      type: "input",
      name: "url",
      message: "Please input the URL of your server",
      default: "https://api.mapbox.com"
    },
    {
      type: "input",
      name: "token",
      message: "Input your token"
    },
    {
      type: "input",
      name: "db_url",
      message: "Input your MongoDB URL",
      default: "localhost"
    },
    {
      type: "input",
      name: "db_name",
      message: "Input your MongoDB database name",
      default: "annotations"
    }
  ])
  .then(answers => {
    // index.html file
    let originalHTML = fs.readFileSync("./template/template.html", "utf8");
    const indexHTML = originalHTML
      .replace("{title}", answers.title)
      .replace("{header}", answers.title)
      .replace("{description}", answers.description)
      .replace("{favicon}", answers.favicon.includes('http') ? `https://${answers.favicon}` : answers.favicon)
      .replace("{logo}", answers.logo.includes('http') ? `https://${answers.logo}` : answers.logo);
    fs.writeFileSync("src/index.html", indexHTML);

    // index.js file
    let originalJS = fs.readFileSync("./template/template.js", "utf8");
    const indexJS = originalJS
      .replace(
        "{url}",
        answers.url.includes("api.mapbox.com") ?
        `https://api.mapbox.com` :
        `${answers.url}`
      )
      .replace("{accessToken}", answers.token);
    fs.writeFileSync("src/index.js", indexJS);

    // app.js file
    let originalAppJS = fs.readFileSync("./template/template_app.js", "utf8");
    const appJS = originalAppJS
      .replace("{db_url}", answers.db_url)
      .replace("{db_name}", answers.db_name)

    if (answers.db_url === 'localhost') {
      console.log("Starting Mongo in Docker")
      exec('docker run -d -p 27017:27017 mongo')
    }

    fs.writeFileSync("src/app.js", appJS);
  });
