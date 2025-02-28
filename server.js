const express = require("express");
const wkhtmltopdf = require("wkhtmltopdf");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json()); // Para recibir JSON en las solicitudes

// Ruta para generar PDF con una plantilla específica
app.post("/generate-pdf", (req, res) => {
    const { template, data } = req.body;

    // Verificar si se especificó una plantilla
    if (!template) {
        return res.status(400).json({ error: "Debes especificar una plantilla." });
    }

    // Construir la ruta del archivo de plantilla
    const templatePath = path.join(__dirname, "templates", `${template}.html`);

    // Verificar si la plantilla existe
    if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ error: `La plantilla '${template}' no existe.` });
    }

    // Leer la plantilla desde el archivo
 let html = fs.readFileSync(templatePath, { encoding: "utf8" });
 


    // Reemplazar los valores dinámicos en la plantilla
    for (const key in data) {
        const regex = new RegExp(`{{${key}}}`, "g");
        html = html.replace(regex, data[key]);
    }

    // Configurar los encabezados para la descarga
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");

    // Convertir HTML a PDF y enviarlo en la respuesta
    wkhtmltopdf(html, { pageSize: "A4" }).pipe(res);
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("PDF Generator running on port 3000");
});
