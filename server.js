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

    // DEBUG: Imprimir en consola lo que recibe el servidor
    console.log("JSON recibido:", JSON.stringify(req.body, null, 2));

    if (!template || !data) {
        return res.status(400).json({ error: "Faltan parámetros en la solicitud." });
    }

    const templatePath = path.join(__dirname, "templates", `${template}.html`);
    if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ error: `La plantilla '${template}' no existe.` });
    }

    let html = fs.readFileSync(templatePath, { encoding: "utf8" });

    // Construcción de la tabla de productos
    if (data.productos && Array.isArray(data.productos)) {
        let filasHTML = "";
        data.productos.forEach(producto => {
            filasHTML += `<tr><td>${producto.nombre}</td><td>${producto.cantidad}</td><td>${producto.precio}</td></tr>`;
        });
        html = html.replace("{{filas_tabla}}", filasHTML);
    } else {
        return res.status(400).json({ error: "El campo 'productos' está vacío o no es una lista válida." });
    }

    // Reemplazo de otras variables en la plantilla
    for (const key in data) {
        if (key !== "productos") {
            const regex = new RegExp(`{{${key}}}`, "g");
            html = html.replace(regex, data[key]);
        }
    }

    

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");

    wkhtmltopdf(html, { pageSize: "A4" }).pipe(res);
});


// Iniciar el servidor
app.listen(3000, () => {
    console.log("PDF Generator running on port 3000");
});
