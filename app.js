document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const formView = document.getElementById('form-view');
    const previewView = document.getElementById('preview-view');
    const reportForm = document.getElementById('report-form');
    
    // Buttons
    const btnPreview = document.getElementById('btn-preview');
    const btnPrint = document.getElementById('btn-print');
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

    // Modal
    const resetModal = document.getElementById('reset-modal');
    const btnConfirmReset = document.getElementById('btn-confirm-reset');
    const btnCancelReset = document.getElementById('btn-cancel-reset');

    // Alcance List
    const alcanceListContainer = document.getElementById('alcance-list');
    const newAlcanceInput = document.getElementById('new-alcance');
    const btnAddAlcance = document.getElementById('btn-add-alcance');
    let alcanceItems = [];

    // State for Images (Base64)
    const imagesState = {
        foto_1: '', foto_2: '', foto_3: '', foto_4: ''
    };

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
                <button type="button" class="btn-remove" data-index="${index}">X</button>
            `;
            alcanceListContainer.appendChild(div);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.btn-remove').forEach(btn => {
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

    // --- Image Handling ---
    function handleImageUpload(inputId, previewId, stateKey) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64String = event.target.result;
                    imagesState[stateKey] = base64String;
                    preview.style.backgroundImage = `url(${base64String})`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    handleImageUpload('foto_1', 'preview-foto-1', 'foto_1');
    handleImageUpload('foto_2', 'preview-foto-2', 'foto_2');
    handleImageUpload('foto_3', 'preview-foto-3', 'foto_3');
    handleImageUpload('foto_4', 'preview-foto-4', 'foto_4');

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

        // Fotos
        const updateDocPhoto = (id, base64, descSourceId, descTargetId) => {
            const img = document.getElementById(`doc-img-${id}`);
            if (base64) {
                img.src = base64;
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
            document.getElementById(descTargetId).textContent = document.getElementById(descSourceId).value;
        };
        
        updateDocPhoto(1, imagesState.foto_1, 'desc_foto_1', 'doc-desc-1');
        updateDocPhoto(2, imagesState.foto_2, 'desc_foto_2', 'doc-desc-2');
        updateDocPhoto(3, imagesState.foto_3, 'desc_foto_3', 'doc-desc-3');
        updateDocPhoto(4, imagesState.foto_4, 'desc_foto_4', 'doc-desc-4');
    }

    // --- Save to JSON ---
    btnSave.addEventListener('click', () => {
        const formData = new FormData(reportForm);
        const data = Object.fromEntries(formData.entries());
        
        // Add lists and images
        data.alcanceItems = alcanceItems;
        data.imagesState = imagesState;

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
                    if (key !== 'alcanceItems' && key !== 'imagesState' && !key.startsWith('foto_')) {
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

                // Restore images
                if (data.imagesState) {
                    ['foto_1', 'foto_2', 'foto_3', 'foto_4'].forEach(key => {
                        imagesState[key] = data.imagesState[key];
                        const preview = document.getElementById(`preview-${key.replace('_', '-')}`);
                        if (imagesState[key]) {
                            preview.style.backgroundImage = `url(${imagesState[key]})`;
                        } else {
                            preview.style.backgroundImage = 'none';
                        }
                    });
                }
                
                alert('Archivo cargado exitosamente.');
                if(isPreview) updatePreview();

            } catch (err) {
                alert('Error al leer el archivo. Formato inválido.');
                console.error(err);
            }
        };
        reader.readAsText(file);
        // Reset input to allow loading the same file again
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
        
        ['foto_1', 'foto_2', 'foto_3', 'foto_4'].forEach(key => {
            imagesState[key] = '';
            document.getElementById(`preview-${key.replace('_', '-')}`).style.backgroundImage = 'none';
        });

        resetModal.style.display = 'none';
        if(isPreview) btnPreview.click(); // Switch back to form view
    });

    // --- Print PDF ---
    btnPrint.addEventListener('click', () => {
        // If not in preview mode, update it first to ensure latest data is printed
        if (!isPreview) {
            updatePreview();
        }
        
        // Use html2pdf for robust PDF generation honoring CSS and structure
        const element = document.getElementById('document-content');
        const filename = (document.getElementById('cod_informe').value || 'Informe_Tecnico') + '.pdf';
        
        // Temporarily ensure preview is visible for the capture if it wasn't
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

    // --- AI Integration ---
    // Load saved API key on startup
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

        if (!descripcion && !imagesState.foto_1 && !imagesState.foto_2 && !imagesState.foto_3 && !imagesState.foto_4) {
            alert('Por favor ingresa al menos una Descripción o sube fotos para que la IA tenga contexto.');
            return;
        }

        btnAiAutocomplete.disabled = true;
        aiLoading.style.display = 'block';

        // Prepare content array for GPT-4o
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

        // Add images if present
        ['foto_1', 'foto_2', 'foto_3', 'foto_4'].forEach(key => {
            if (imagesState[key]) {
                messagesContent.push({
                    type: "image_url",
                    image_url: { url: imagesState[key] }
                });
            }
        });

        try {
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
                // Append instead of replacing to not lose existing user items
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

    // Initialize empty Alcance list
    renderAlcanceList();
});
