// ==========================================================================
// GearGen-3D Navigation & Menu Bar Controller
// Top Bar Dropdowns, Modals & Quick Actions (JSON Spec Compliant)
// ==========================================================================

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('Initializing CAD Navigation controller...');
        this.setupQuickActions();
        this.setupLanguageSwitcher();
    }

    setupQuickActions() {
        const helpBtn = document.getElementById('help-quick-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelpModal();
            });
        }

        const githubBtn = document.getElementById('github-quick-btn');
        if (githubBtn) {
            githubBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://github.com/JB07-198/GearGen-3D', '_blank');
            });
        }
    }

    setupLanguageSwitcher() {
        const switcher = document.querySelector('.language-switcher');
        const triggerBtn = document.querySelector('.language-btn');

        if (!switcher || !triggerBtn) return;

        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            switcher.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                switcher.classList.remove('active');
            }
        });

        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                if (window.i18n) {
                    window.i18n.switchLanguage(lang);
                    this.updateLanguageUI(lang);
                    switcher.classList.remove('active');
                }
            });
        });

        if (window.i18n) {
            this.updateLanguageUI(window.i18n.getCurrentLanguage());
        }
    }

    updateLanguageUI(lang) {
        const flags = { en: '🇺🇸', fr: '🇫🇷', ar: '🇲🇦' };
        const labels = { en: 'EN', fr: 'FR', ar: 'AR' };

        const flagEl = document.querySelector('.language-btn .lang-flag');
        const textEl = document.querySelector('.language-btn .lang-name');

        if (flagEl) flagEl.textContent = flags[lang] || '🇺🇸';
        if (textEl) textEl.textContent = labels[lang] || 'EN';

        document.querySelectorAll('.language-option').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });
    }

    // Modal Builder
    createModal(id, titleHtml, bodyHtml) {
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${titleHtml}</h2>
                    <button class="modal-close" title="Close"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    ${bodyHtml}
                </div>
            </div>
        `;

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 250);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        return modal;
    }

    showHelpModal() {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        const content = {
            en: `
                <h3>Welcome to GearGen-3D</h3>
                <p>GearGen-3D is an engineering-grade 3D gear generator adhering to ISO 53 standards, running in real-time WebGL.</p>
                <h3>Basic Workflow</h3>
                <ol>
                    <li><strong>Gear Type:</strong> Select one of the 7 supported gear types in the left panel.</li>
                    <li><strong>Parameters:</strong> Adjust Module, Teeth, Pressure Angle, and dimensions in the right panel.</li>
                    <li><strong>3D View:</strong> Inspect geometry using OrbitControls (rotate, pan, zoom) and camera shortcuts.</li>
                    <li><strong>Export:</strong> Download binary STL (for 3D printing) or faceted B-Rep STEP via the File menu or Export button.</li>
                </ol>
                <h3>Key Shortcuts</h3>
                <ul>
                    <li><code>R</code>: Isometric View | <code>1</code>: Top View | <code>2</code>: Front View | <code>3</code>: Side View | <code>0</code>: Reset</li>
                    <li><code>G</code>: Toggle Grid | <code>A</code>: Toggle Axis | <code>W</code>: Toggle Wireframe</li>
                    <li><code>+</code> / <code>-</code>: Zoom In / Zoom Out</li>
                </ul>
                <p>Need support or feature requests? <a href="https://github.com/JB07-198/GearGen-3D" target="_blank">Visit GitHub</a> or <a href="mailto:contacte.baiha@gmail.com">Contact Us</a>.</p>
            `,
            fr: `
                <h3>Bienvenue sur GearGen-3D</h3>
                <p>GearGen-3D est un générateur d'engrenages 3D de précision industrielle basé sur la norme ISO 53, propulsé en WebGL temps réel.</p>
                <h3>Procédure d'Utilisation</h3>
                <ol>
                    <li><strong>Type d'engrenage :</strong> Choisissez parmi les 7 types disponibles dans le volet de gauche.</li>
                    <li><strong>Paramètres :</strong> Réglez le module, le nombre de dents, l'angle de pression et les dimensions.</li>
                    <li><strong>Visualisation 3D :</strong> Manipulez le modèle avec la souris/tactile ou les raccourcis de caméra.</li>
                    <li><strong>Exportation :</strong> Téléchargez le modèle en STL binaire ou en STEP via le menu Fichier ou le bouton Exporter.</li>
                </ol>
                <h3>Raccourcis Clavier</h3>
                <ul>
                    <li><code>R</code> : Vue isométrique | <code>1</code> : Dessus | <code>2</code> : Face | <code>3</code> : Côté | <code>0</code> : Réinitialiser</li>
                    <li><code>G</code> : Grille | <code>A</code> : Axes | <code>W</code> : Fil de fer</li>
                    <li><code>+</code> / <code>-</code> : Zoom avant / arrière</li>
                </ul>
                <p>Questions ou assistance ? <a href="https://github.com/JB07-198/GearGen-3D" target="_blank">Dépôt GitHub</a> ou <a href="mailto:contacte.baiha@gmail.com">Contactez-nous</a>.</p>
            `,
            ar: `
                <h3>مرحباً بك في GearGen-3D</h3>
                <p>برنامج GearGen-3D هو مولد هندسي للتروس ثلاثية الأبعاد مطابق لمعايير ISO 53 ويعمل بتقنية WebGL في الوقت الفعلي.</p>
                <h3>طريقة الاستخدام</h3>
                <ol>
                    <li><strong>نوع الترس:</strong> اختر أحد الأنواع السبعة المتوفرة في اللوحة اليمنى/اليسرى.</li>
                    <li><strong>المعاملات:</strong> اضبط المعامل، عدد الأسنان، زاوية الضغط والأبعاد في لوحة التحكم.</li>
                    <li><strong>العرض ثلاثي الأبعاد:</strong> عاين النموذج باستخدام التكبير والتصغير وتغيير زوايا المشاهدة.</li>
                    <li><strong>التصدير:</strong> نزّل الملف بتنسيق STL للطباعة ثلاثية الأبعاد أو STEP لبرامج الهندسة الميكانيكية.</li>
                </ol>
                <h3>اختصارات لوحة المفاتيح</h3>
                <ul>
                    <li><code>R</code>: متساوي القياس | <code>1</code>: علوي | <code>2</code>: أمامي | <code>3</code>: جانبي | <code>0</code>: إعادة ضبط</li>
                    <li><code>G</code>: الشبكة | <code>A</code>: المحاور | <code>W</code>: الإطار السلكي</li>
                    <li><code>+</code> / <code>-</code>: تكبير / تصغير</li>
                </ul>
            `
        };

        const titles = {
            en: '<i class="fas fa-question-circle"></i> Help & Quick Guide',
            fr: '<i class="fas fa-question-circle"></i> Guide d\'Aide Rapide',
            ar: '<i class="fas fa-question-circle"></i> دليل المساعدة السريع'
        };

        this.createModal('help-modal', titles[lang] || titles['en'], content[lang] || content['en']);
    }

    showDocumentationModal() {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        const content = {
            en: `
                <h3>ISO 53 Gear Formulas</h3>
                <p>Gears are generated strictly adhering to ISO 53 metric standardized involute gear profiles:</p>
                <ul>
                    <li><strong>Pitch Diameter (d):</strong> <code>d = m × z</code></li>
                    <li><strong>Circular Pitch (p):</strong> <code>p = π × m</code></li>
                    <li><strong>Base Diameter (db):</strong> <code>db = d × cos(α)</code></li>
                    <li><strong>Addendum (ha):</strong> <code>ha = 1.0 × m</code></li>
                    <li><strong>Dedendum (hf):</strong> <code>hf = 1.25 × m</code></li>
                    <li><strong>Tip Diameter (da):</strong> <code>da = d + 2 × ha</code></li>
                    <li><strong>Root Diameter (df):</strong> <code>df = d - 2 × hf</code></li>
                </ul>
                <h3>Standard Pressure Angles</h3>
                <ul>
                    <li><strong>20.0°:</strong> Universal ISO standard; optimal blend of strength, quietness, and efficiency.</li>
                    <li><strong>14.5°:</strong> Legacy profile with lower radial separating forces.</li>
                    <li><strong>25.0°:</strong> Heavy-duty high-load gears offering thick tooth root resistance.</li>
                </ul>
                <h3>Export Specifications</h3>
                <p><strong>STL (Binary):</strong> Compact binary representation with normal vectors, 100% compatible with Cura, PrusaSlicer, Bambu Studio.</p>
                <p><strong>STEP (AP214):</strong> Standard for Exchange of Product model data with faceted B-Rep solids, compatible with SolidWorks, Fusion 360, FreeCAD, NX.</p>
            `,
            fr: `
                <h3>Formules d'Engrenages ISO 53</h3>
                <p>Les profils sont calculés selon le standard métrique ISO 53 à développante de cercle :</p>
                <ul>
                    <li><strong>Diamètre primitif (d) :</strong> <code>d = m × z</code></li>
                    <li><strong>Pas circulaire (p) :</strong> <code>p = π × m</code></li>
                    <li><strong>Diamètre de base (db) :</strong> <code>db = d × cos(α)</code></li>
                    <li><strong>Saillie (ha) :</strong> <code>ha = 1,0 × m</code></li>
                    <li><strong>Creux (hf) :</strong> <code>hf = 1,25 × m</code></li>
                    <li><strong>Diamètre de tête (da) :</strong> <code>da = d + 2 × ha</code></li>
                    <li><strong>Diamètre de pied (df) :</strong> <code>df = d - 2 × hf</code></li>
                </ul>
                <h3>Angles de Pression Normalisés</h3>
                <ul>
                    <li><strong>20,0° :</strong> Standard mondial équilibré en résistance et rendement.</li>
                    <li><strong>14,5° :</strong> Ancien profil limitant l'effort radial d'écartement.</li>
                    <li><strong>25,0° :</strong> Forte charge, épaisseur de dent renforcée à la base.</li>
                </ul>
                <h3>Spécifications d'Exportation</h3>
                <p><strong>STL (Binaire) :</strong> Format compact avec vecteurs normaux, prêt pour le tranchage 3D.</p>
                <p><strong>STEP (AP214) :</strong> B-Rep géométrique facetté pour SolidWorks, Fusion 360, FreeCAD, Onshape.</p>
            `,
            ar: `
                <h3>المعادلات الهندسية القياسية ISO 53</h3>
                <p>يتم توليد هندسة الأسنان وفقاً لمعيار ISO 53 المتري:</p>
                <ul>
                    <li><strong>القطر الأولي (d):</strong> <code>d = m × z</code></li>
                    <li><strong>الخطوة الدائرية (p):</strong> <code>p = π × m</code></li>
                    <li><strong>قطر القاعدة (db):</strong> <code>db = d × cos(α)</code></li>
                    <li><strong>ارتفاع الرأس (ha):</strong> <code>ha = 1.0 × m</code></li>
                    <li><strong>عمق القاع (hf):</strong> <code>hf = 1.25 × m</code></li>
                </ul>
            `
        };

        const titles = {
            en: '<i class="fas fa-book"></i> Engineering Documentation (ISO 53)',
            fr: '<i class="fas fa-book"></i> Documentation Technique (ISO 53)',
            ar: '<i class="fas fa-book"></i> التوثيق الهندسي (ISO 53)'
        };

        this.createModal('doc-modal', titles[lang] || titles['en'], content[lang] || content['en']);
    }

    showExportModal() {
        if (window.exportUI) {
            window.exportUI.openModal();
        }
    }
}
