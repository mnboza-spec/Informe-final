document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const formView = document.getElementById('form-view');
    const previewView = document.getElementById('preview-view');
    const reportForm = document.getElementById('report-form');
    
    // Buttons
    const btnPreview = document.getElementById('btn-preview');
    const btnPrint = document.getElementById('btn-print');
    const btnWord = document.getElementById('btn-word');
    const btnSave = document.getElementById('btn-save');
    const btnReset = document.getElementById('btn-reset');
    const fileUpload = document.getElementById('file-upload');
    
    // AI Elements
    const btnAiSettings = document.getElementById('btn-ai-settings');
    const aiSettingsModal = document.getElementById('ai-settings-modal');
    const btnSaveAi = document.getElementById('btn-save-ai');
    const btnCancelAi = document.getElementById('btn-cancel-ai');
    const inputApiKey = document.getElementById('openai-api-key');
    const btnAiAutocomplete = document.getElementById('btn-ai-autocomplete');
    const aiLoading = document.getElementById('ai-loading');
    const aiContextPhotosInput = document.getElementById('ai-context-photos');

    // Modal
    const resetModal = document.getElementById('reset-modal');
    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    const btnCancelReset = document.getElementById('btn-cancel-reset');

    // Alcance List
    const alcanceListContainer = document.getElementById('alcance-list');
    const newAlcanceInput = document.getElementById('new-alcance');
    const btnAddAlcance = document.getElementById('btn-add-alcance');
    let alcanceItems = [];

    // Dynamic Photos State
    // Each object: { id: number, base64: string, desc: string }
    let reportPhotos = [];
    let photoIdCounter = 0;
    const dynamicPhotosContainer = document.getElementById('dynamic-photos-container');
    const btnAddPhoto = document.getElementById('btn-add-photo');

    // --- View Toggle ---
    let isPreview = false;
    btnPreview.addEventListener('click', () => {
        isPreview = !isPreview;
        if (isPreview) {
            updatePreview();
            formView.classList.remove('active');
            previewView.style.display = 'block';
            setTimeout(() => previewView.classList.add('active'), 10);
            btnPreview.textContent = 'Editar Informe';
        } else {
            previewView.classList.remove('active');
            setTimeout(() => {
                previewView.style.display = 'none';
                formView.classList.add('active');
            }, 400);
            btnPreview.textContent = 'Vista Previa';
        }
    });

    // --- Dynamic Checklist (Alcance) ---
    function renderAlcanceList() {
        alcanceListContainer.innerHTML = '';
        alcanceItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.innerHTML = `
                <span>${item}</span>
                <button type="button" class="btn-remove-alcance" data-index="${index}">X</button>
            `;
            alcanceListContainer.appendChild(div);
        });

        document.querySelectorAll('.btn-remove-alcance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                alcanceItems.splice(index, 1);
                renderAlcanceList();
            });
        });
    }

    btnAddAlcance.addEventListener('click', () => {
        const val = newAlcanceInput.value.trim();
        if (val) {
            alcanceItems.push(val);
            newAlcanceInput.value = '';
            renderAlcanceList();
        }
    });
    newAlcanceInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnAddAlcance.click();
        }
    });

    // --- Dynamic Photos Logic ---
    function renderDynamicPhotos() {
        dynamicPhotosContainer.innerHTML = '';
        reportPhotos.forEach((photo, index) => {
            const card = document.createElement('div');
            card.className = 'photo-upload-card';
            card.innerHTML = `
                <label>Foto ${index + 1}</label>
                <div class="img-preview" id="preview-photo-${photo.id}" style="background-image: ${photo.base64 ? `url(${photo.base64})` : 'none'}"></div>
                <input type="file" id="input-photo-${photo.id}" accept="image/*">
                <input type="text" id="desc-photo-${photo.id}" placeholder="Descripción de la foto" value="${photo.desc}">
                <button type="button" class="btn btn-sm btn-danger btn-remove-photo" style="margin-top:10px" data-id="${photo.id}">Eliminar Foto</button>
            `;
            dynamicPhotosContainer.appendChild(card);

            // Setup listeners for this card
            document.getElementById(`input-photo-${photo.id}`).addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        photo.base64 = event.target.result;
                        document.getElementById(`preview-photo-${photo.id}`).style.backgroundImage = `url(${photo.base64})`;
                    };
                    reader.readAsDataURL(file);
                }
            });

            document.getElementById(`desc-photo-${photo.id}`).addEventListener('input', (e) => {
                photo.desc = e.target.value;
            });
        });

        document.querySelectorAll('.btn-remove-photo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                reportPhotos = reportPhotos.filter(p => p.id !== id);
                renderDynamicPhotos();
            });
        });
    }

    btnAddPhoto.addEventListener('click', () => {
        photoIdCounter++;
        reportPhotos.push({ id: photoIdCounter, base64: '', desc: '' });
        renderDynamicPhotos();
    });

    // Helpers to convert File to Base64 (for AI)
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // --- Update Preview Document ---
    function updatePreview() {
        // Text Fields
        document.getElementById('doc-num-informe').textContent = `Informe N° ${document.getElementById('num_informe').value}`;
        document.getElementById('doc-det-proyecto').textContent = document.getElementById('det_proyecto').value;
        document.getElementById('doc-det-cliente').textContent = document.getElementById('det_cliente').value;
        document.getElementById('doc-det-fecha').textContent = document.getElementById('det_fecha').value;
        document.getElementById('doc-introduccion').innerHTML = document.getElementById('introduccion').value.replace(/\n/g, '<br>');
        
        document.getElementById('doc-obj-1').textContent = document.getElementById('obj_1').value;
        document.getElementById('doc-obj-2').textContent = document.getElementById('obj_2').value;
        document.getElementById('doc-obj-3').textContent = document.getElementById('obj_3').value;

        // Alcance
        const docAlcanceList = document.getElementById('doc-alcance-list');
        docAlcanceList.innerHTML = '';
        alcanceItems.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            docAlcanceList.appendChild(li);
        });

        // Recursos
        document.getElementById('doc-mo-operarios').textContent = document.getElementById('mo_operarios').value || '0';
        document.getElementById('doc-mo-prevencionistas').textContent = document.getElementById('mo_prevencionistas').value || '0';
        document.getElementById('doc-mo-ayudantes').textContent = document.getElementById('mo_ayudantes').value || '0';
        
        document.getElementById('doc-he-altura').textContent = document.getElementById('he_altura').value;
        document.getElementById('doc-he-seguridad').textContent = document.getElementById('he_seguridad').value;
        document.getElementById('doc-he-especificas').textContent = document.getElementById('he_especificas').value;
        document.getElementById('doc-he-mecanicos').textContent = document.getElementById('he_mecanicos').value;
        
        document.getElementById('doc-mat-principales').textContent = document.getElementById('mat_principales').value;
        document.getElementById('doc-mat-limpieza').textContent = document.getElementById('mat_limpieza').value;
        document.getElementById('doc-mat-residuos').textContent = document.getElementById('mat_residuos').value;

        // Procedimiento
        document.getElementById('doc-proc-1').innerHTML = document.getElementById('proc_1').value.replace(/\n/g, '<br>');
        document.getElementById('doc-proc-2').innerHTML = document.getElementById('proc_2').value.replace(/\n/g, '<br>');
        document.getElementById('doc-proc-3').innerHTML = document.getElementById('proc_3').value.replace(/\n/g, '<br>');

        // Conclusiones y Recomendaciones
        const fillList = (sourceId, targetId) => {
            const sourceText = document.getElementById(sourceId).value;
            const targetEl = document.getElementById(targetId);
            targetEl.innerHTML = '';
            if (sourceText.trim()) {
                sourceText.split('\n').forEach(line => {
                    if (line.trim()) {
                        const li = document.createElement('li');
                        li.textContent = line.trim();
                        targetEl.appendChild(li);
                    }
                });
            }
        };
        fillList('conclusiones', 'doc-conclusiones');
        fillList('recomendaciones', 'doc-recomendaciones');

        // Firma
        document.getElementById('doc-firma-nombre').textContent = document.getElementById('firma_nombre').value;

        // Dynamic Photos Preview
        const docPhotoList = document.getElementById('doc-photo-list');
        docPhotoList.innerHTML = '';
        reportPhotos.forEach((photo) => {
            if (photo.base64 || photo.desc) {
                const item = document.createElement('div');
                item.className = 'doc-photo-item';
                item.innerHTML = `
                    <div class="photo-img-box">
                        ${photo.base64 ? `<img src="${photo.base64}" alt="Foto">` : ''}
                    </div>
                    <p class="photo-caption">${photo.desc}</p>
                `;
                docPhotoList.appendChild(item);
            }
        });
    }

    // --- Save to JSON ---
    btnSave.addEventListener('click', () => {
        const formData = new FormData(reportForm);
        const data = Object.fromEntries(formData.entries());
        
        // Add lists and images
        data.alcanceItems = alcanceItems;
        data.reportPhotos = reportPhotos;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const downloadAnchorNode = document.createElement('a');
        
        const fileName = (document.getElementById('cod_informe').value || 'informe') + '.gemsa';
        
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    // --- Load from JSON ---
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // Restore form fields
                Object.keys(data).forEach(key => {
                    if (key !== 'alcanceItems' && key !== 'reportPhotos') {
                        const el = document.getElementById(key);
                        if (el) {
                            el.value = data[key];
                        }
                    }
                });

                // Restore alcance items
                if (data.alcanceItems) {
                    alcanceItems = data.alcanceItems;
                    renderAlcanceList();
                }

                // Restore dynamic photos
                if (data.reportPhotos) {
                    reportPhotos = data.reportPhotos;
                    // update max id
                    if (reportPhotos.length > 0) {
                        photoIdCounter = Math.max(...reportPhotos.map(p => p.id));
                    }
                    renderDynamicPhotos();
                }
                
                alert('Archivo cargado exitosamente.');
                if(isPreview) updatePreview();

            } catch (err) {
                alert('Error al leer el archivo. Formato inválido.');
                console.error(err);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // --- Reset Form ---
    btnReset.addEventListener('click', () => {
        resetModal.style.display = 'flex';
    });

    btnCancelReset.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });

    btnConfirmReset.addEventListener('click', () => {
        reportForm.reset();
        alcanceItems = [];
        renderAlcanceList();
        
        reportPhotos = [];
        renderDynamicPhotos();
        aiContextPhotosInput.value = '';

        resetModal.style.display = 'none';
        if(isPreview) btnPreview.click(); // Switch back to form view
    });

    // --- Print PDF ---
    btnPrint.addEventListener('click', () => {
        if (!isPreview) updatePreview();
        
        const element = document.getElementById('document-content');
        const filename = (document.getElementById('cod_informe').value || 'Informe_Tecnico') + '.pdf';
        
        const wasHidden = !isPreview;
        if (wasHidden) {
            previewView.style.display = 'block';
            previewView.style.opacity = '1';
        }

        const opt = {
            margin:       0,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            if (wasHidden) {
                previewView.style.display = 'none';
            }
        });
    });

    // --- Export Word (.doc) ---
    btnWord.addEventListener('click', () => {
        if (!isPreview) updatePreview();
        
        const content = document.getElementById('document-content').innerHTML;
        const styles = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
                } catch(e) {
                    return ''; // CORS issue with external sheets
                }
            }).join('\n');

        const html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Export HTML To Doc</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    ${styles}
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', html], {
            type: 'application/msword'
        });
        
        const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
        const filename = (document.getElementById('cod_informe').value || 'Informe_Tecnico') + '.doc';
        
        const downloadLink = document.createElement("a");
        document.body.appendChild(downloadLink);
        
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            downloadLink.href = url;
            downloadLink.download = filename;
            downloadLink.click();
        }
        document.body.removeChild(downloadLink);
    });

    // --- AI Integration ---
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
        inputApiKey.value = savedApiKey;
    }

    btnAiSettings.addEventListener('click', () => {
        aiSettingsModal.style.display = 'flex';
    });

    btnCancelAi.addEventListener('click', () => {
        aiSettingsModal.style.display = 'none';
    });

    btnSaveAi.addEventListener('click', () => {
        const key = inputApiKey.value.trim();
        if (key) {
            localStorage.setItem('openai_api_key', key);
            alert('API Key guardada exitosamente.');
            aiSettingsModal.style.display = 'none';
        } else {
            alert('Por favor ingresa una API Key válida.');
        }
    });

    btnAiAutocomplete.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            alert('Por favor configura tu OpenAI API Key en la configuración (⚙️ Config IA) primero.');
            aiSettingsModal.style.display = 'flex';
            return;
        }

        const descripcion = document.getElementById('introduccion').value;
        const nombreProyecto = document.getElementById('nombre_proyecto').value;
        const detProyecto = document.getElementById('det_proyecto').value;

        const files = aiContextPhotosInput.files;

        if (!descripcion && files.length === 0) {
            alert('Por favor ingresa una Descripción o sube fotos de contexto para que la IA tenga información.');
            return;
        }

        btnAiAutocomplete.disabled = true;
        aiLoading.style.display = 'block';

        const messagesContent = [
            {
                type: "text",
                text: `Eres un inspector técnico de servicios generales (GEMSA). 
Genera un informe estructurado en base a esta descripción y las imágenes proporcionadas. 
Nombre Proyecto: ${nombreProyecto}
Detalle: ${detProyecto}
Descripción: ${descripcion}

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura y nada más:
{
  "obj_1": "Objetivo 1...",
  "obj_2": "Objetivo 2...",
  "alcanceItems": ["Paso 1", "Paso 2", "Paso 3..."],
  "proc_1": "Texto para Planificación...",
  "proc_2": "Texto para Desarrollo técnico...",
  "proc_3": "Texto para Limpieza...",
  "conclusiones": "Conclusión 1\\nConclusión 2...",
  "recomendaciones": "Recomendación 1\\nRecomendación 2..."
}
Usa lenguaje técnico, profesional y formal.`
            }
        ];

        try {
            // Process AI Context Photos
            for (let i = 0; i < files.length; i++) {
                const base64 = await fileToBase64(files[i]);
                messagesContent.push({
                    type: "image_url",
                    image_url: { url: base64 }
                });
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: messagesContent
                        }
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: 1500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'Error en la llamada a OpenAI');
            }

            const data = await response.json();
            const aiResult = JSON.parse(data.choices[0].message.content);

            // Populate Form
            if (aiResult.obj_1) document.getElementById('obj_1').value = aiResult.obj_1;
            if (aiResult.obj_2) document.getElementById('obj_2').value = aiResult.obj_2;
            if (aiResult.proc_1) document.getElementById('proc_1').value = aiResult.proc_1;
            if (aiResult.proc_2) document.getElementById('proc_2').value = aiResult.proc_2;
            if (aiResult.proc_3) document.getElementById('proc_3').value = aiResult.proc_3;
            if (aiResult.conclusiones) document.getElementById('conclusiones').value = aiResult.conclusiones;
            if (aiResult.recomendaciones) document.getElementById('recomendaciones').value = aiResult.recomendaciones;

            if (aiResult.alcanceItems && Array.isArray(aiResult.alcanceItems)) {
                aiResult.alcanceItems.forEach(item => {
                    if (!alcanceItems.includes(item)) alcanceItems.push(item);
                });
                renderAlcanceList();
            }

            alert('¡Contenido generado exitosamente!');

        } catch (error) {
            console.error(error);
            alert('Error al generar el contenido con IA: ' + error.message);
        } finally {
            btnAiAutocomplete.disabled = false;
            aiLoading.style.display = 'none';
        }
    });

    // Initialize
    renderAlcanceList();
    renderDynamicPhotos();
});
