const express = require("express");
const wkhtmltopdf = require("wkhtmltopdf");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json()); // Para recibir JSON en las solicitudes

app.post("/debug", (req, res) => {
    console.log("JSON recibido:", JSON.stringify(req.body, null, 2));
    res.json({ recibido: req.body });
});


app.post("/generate-pdf", (req, res) => {
    const { template, data } = req.body;

    console.log("JSON recibido:", JSON.stringify(req.body, null, 2));

    if (!template || !data || !data.cliente) {
        return res.status(400).json({ error: "Faltan parámetros en la solicitud." });
    }

    const templatePath = path.join(__dirname, "templates", `${template}.html`);
    if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ error: `La plantilla '${template}' no existe.` });
    }

    let html = fs.readFileSync(templatePath, { encoding: "utf8" });

    // 🔹 ASIGNAR LOGO AUTOMÁTICAMENTE SEGÚN EL CLIENTE
    const logoMap = {
        "Publimontajes S.A": "https://i0.wp.com/publiexcr.com/wp-content/uploads/2022/10/logo-color.png",
        "Exodus Advertising": "https://i0.wp.com/publiexcr.com/wp-content/uploads/2022/10/logo-color.png",
        "Default": "https://i0.wp.com/publiexcr.com/wp-content/uploads/2022/10/logo-color.png"
    };
    const logoURL = logoMap[data.cliente] || logoMap["Default"];
    html = html.replace("{{logo}}", logoURL);

    // 🔹 CONSTRUIR LA TABLA DE PRODUCTOS
 // 🔹 REEMPLAZAR VARIABLES DINÁMICAS
 for (const key in data) {
    if (key !== "lieasodc") {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, data[key]);
    }
}


    // 🔹 REEMPLAZAR OTRAS VARIABLES EN LA PLANTILLA
    // for (const key in data) {
    //     if (key !== "lieasodc") {
    //         const regex = new RegExp(`{{${key}}}`, "g");
    //         html = html.replace(regex, data[key]);
    //     }
    // }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");

    wkhtmltopdf(html, { pageSize: "A4" }).pipe(res);
});



// Iniciar el servidor
app.listen(3000, () => {
    console.log("PDF Generator running on port 3000");
});
