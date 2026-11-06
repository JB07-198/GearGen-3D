// ==========================================================================
// GearGen-3D Navigation & Menu Bar Controller
// Top Bar Dropdowns, Modals & Quick Actions
// ==========================================================================

class Navigation {
    constructor() {
        this.init();
    }

    init() {
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
                <p>GearGen-3D is a parametric 3D gear generator running in real-time WebGL. Tooth proportions follow the ISO 53 basic rack; see the documentation for its simplifications.</p>
                <h3>Basic Workflow</h3>
                <ol>
                    <li><strong>Gear Type:</strong> Select one of the 7 supported gear types in the left panel.</li>
                    <li><strong>Parameters:</strong> Adjust Module, Teeth, Pressure Angle, and dimensions in the right panel.</li>
                    <li><strong>3D View:</strong> Inspect geometry using OrbitControls (rotate, pan, zoom) and camera shortcuts.</li>
                    <li><strong>Export:</strong> Download binary STL (for 3D printing) or a STEP solid via the File menu or Export button.</li>
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
                <p>GearGen-3D est un générateur d'engrenages 3D paramétrique, en WebGL temps réel. Les proportions des dents suivent le profil de référence ISO 53 ; la documentation précise ses simplifications.</p>
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
                <p>برنامج GearGen-3D هو مولد بارامتري للتروس ثلاثية الأبعاد يعمل بتقنية WebGL في الوقت الفعلي. تتبع نسب الأسنان الجريدة المرجعية ISO 53، وتوضح الوثائق التبسيطات المعتمدة.</p>
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
                <h3>Gear Formulas</h3>
                <p>Involute profiles use the proportions of the ISO 53 basic rack. Simplifications: no root fillet, no profile shift and no backlash, so printed parts may need clearance.</p>
                <ul>
                    <li><strong>Pitch Diameter (d):</strong> <code>d = m × z</code></li>
                    <li><strong>Circular Pitch (p):</strong> <code>p = π × m</code></li>
                    <li><strong>Base Diameter (db):</strong> <code>db = d × cos(α)</code></li>
                    <li><strong>Addendum (ha):</strong> <code>ha = 1.0 × m</code></li>
                    <li><strong>Dedendum (hf):</strong> <code>hf = 1.25 × m</code></li>
                    <li><strong>Tip Diameter (da):</strong> <code>da = d + 2 × ha</code></li>
                    <li><strong>Root Diameter (df):</strong> <code>df = d - 2 × hf</code></li>
                </ul>
                <h3>Specific Models</h3>
                <ul>
                    <li><strong>Bevel:</strong> virtual gear <code>zv = z / cos(δ)</code> (Tredgold), <code>da = d + 2m × cos(δ)</code>; face width is measured along the cone.</li>
                    <li><strong>Worm:</strong> <code>d1 = q × m</code>, axial pitch <code>π × m</code>, lead angle <code>tan(γ) = z1 / q</code>, thread depth <code>2.25 × m</code>.</li>
                    <li><strong>Helical:</strong> the module is the transverse module, so <code>d = m × z</code>.</li>
                    <li><strong>Hub:</strong> cylinder on the top side, of length half the face width.</li>
                </ul>
                <h3>Standard Pressure Angles</h3>
                <ul>
                    <li><strong>20.0°:</strong> Universal ISO standard; optimal blend of strength, quietness, and efficiency.</li>
                    <li><strong>14.5°:</strong> Legacy profile with lower radial separating forces.</li>
                    <li><strong>25.0°:</strong> Heavy-duty high-load gears offering thick tooth root resistance.</li>
                </ul>
                <h3>Export Specifications</h3>
                <p><strong>STL (Binary):</strong> Compact binary format for slicers, with the gear axis on Z.</p>
                <p><strong>STEP (AP214):</strong> One closed solid per part, made of planar faces. It can be measured and cut, but flanks and bores are facets rather than analytic surfaces.</p>
            `,
            fr: `
                <h3>Formules d'Engrenages</h3>
                <p>Les profils en développante utilisent les proportions du profil de référence ISO 53. Simplifications : pas de congé de pied, de déport ni de jeu, donc des pièces imprimées peuvent demander du jeu.</p>
                <ul>
                    <li><strong>Diamètre primitif (d) :</strong> <code>d = m × z</code></li>
                    <li><strong>Pas circulaire (p) :</strong> <code>p = π × m</code></li>
                    <li><strong>Diamètre de base (db) :</strong> <code>db = d × cos(α)</code></li>
                    <li><strong>Saillie (ha) :</strong> <code>ha = 1,0 × m</code></li>
                    <li><strong>Creux (hf) :</strong> <code>hf = 1,25 × m</code></li>
                    <li><strong>Diamètre de tête (da) :</strong> <code>da = d + 2 × ha</code></li>
                    <li><strong>Diamètre de pied (df) :</strong> <code>df = d - 2 × hf</code></li>
                </ul>
                <h3>Modèles Spécifiques</h3>
                <ul>
                    <li><strong>Conique :</strong> roue virtuelle <code>zv = z / cos(δ)</code> (Tredgold), <code>da = d + 2m × cos(δ)</code> ; la largeur se mesure le long du cône.</li>
                    <li><strong>Vis sans fin :</strong> <code>d1 = q × m</code>, pas axial <code>π × m</code>, angle d'hélice <code>tan(γ) = z1 / q</code>, hauteur de filet <code>2,25 × m</code>.</li>
                    <li><strong>Hélicoïdal :</strong> le module est le module apparent, donc <code>d = m × z</code>.</li>
                    <li><strong>Moyeu :</strong> cylindre côté supérieur, de longueur égale à la moitié de la largeur.</li>
                </ul>
                <h3>Angles de Pression Normalisés</h3>
                <ul>
                    <li><strong>20,0° :</strong> Standard mondial équilibré en résistance et rendement.</li>
                    <li><strong>14,5° :</strong> Ancien profil limitant l'effort radial d'écartement.</li>
                    <li><strong>25,0° :</strong> Forte charge, épaisseur de dent renforcée à la base.</li>
                </ul>
                <h3>Spécifications d'Exportation</h3>
                <p><strong>STL (Binaire) :</strong> Format compact pour le tranchage 3D, avec l'axe de l'engrenage sur Z.</p>
                <p><strong>STEP (AP214) :</strong> Un solide fermé par pièce, à faces planes. Il se mesure et se coupe, mais flancs et alésages sont des facettes, pas des surfaces analytiques.</p>
            `,
            ar: `
                <h3>معادلات التروس</h3>
                <p>تستخدم المقاطع نسب الجريدة المرجعية ISO 53، دون تدوير عند الجذر ودون إزاحة أو خلوص.</p>
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
            en: '<i class="fas fa-book"></i> Engineering Documentation',
            fr: '<i class="fas fa-book"></i> Documentation Technique',
            ar: '<i class="fas fa-book"></i> التوثيق الهندسي'
        };

        this.createModal('doc-modal', titles[lang] || titles['en'], content[lang] || content['en']);
    }
}
