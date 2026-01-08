// Navigation and Button Logic
class Navigation {
    constructor() {
        this.init();
    }

    init() {
        console.log('Initializing navigation...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // GitHub button
        const githubBtn = document.getElementById('github-btn');
        if (githubBtn) {
            githubBtn.addEventListener('click', () => {
                window.open('https://github.com/JB07-198/GearGen-3D', '_blank');
            });
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }

        // Documentation link
        const docLink = document.querySelector('a[href="#"][data-i18n="footer.documentation"]');
        if (docLink) {
            docLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDocumentationModal();
            });
        }

        // Report Issue link
        const reportLink = document.querySelector('a[href="#"][data-i18n="footer.reportIssue"]');
        if (reportLink) {
            reportLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://github.com/JB07-198/GearGen-3D/issues', '_blank');
            });
        }

        // Contact link
        const contactLink = document.querySelector('a[href="#"][data-i18n="footer.contact"]');
        if (contactLink) {
            contactLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'mailto:contacte.baiha@gmail.com';
            });
        }

        // Language switcher
        this.setupLanguageSwitcher();
    }

    setupLanguageSwitcher() {
        const languageSwitcher = document.querySelector('.language-switcher');
        const languageBtn = document.querySelector('.language-btn');

        if (!languageSwitcher || !languageBtn) return;

        // Toggle dropdown
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageSwitcher.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!languageSwitcher.contains(e.target)) {
                languageSwitcher.classList.remove('active');
            }
        });

        // Language option clicks
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                if (window.i18n) {
                    window.i18n.switchLanguage(lang);
                    this.updateLanguageSwitcher(lang);
                    languageSwitcher.classList.remove('active');
                }
            });
        });

        // Update initial state
        if (window.i18n) {
            this.updateLanguageSwitcher(window.i18n.getCurrentLanguage());
        }
    }

    updateLanguageSwitcher(lang) {
        // Update active state
        document.querySelectorAll('.language-option').forEach(option => {
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Update button text
        const languageNames = {
            'en': 'English',
            'fr': 'Français',
            'ar': 'العربية'
        };

        const languageFlags = {
            'en': '🇺🇸',
            'fr': '🇫🇷',
            'ar': '🇲🇦'
        };

        const languageBtn = document.querySelector('.language-btn span:not(.lang-flag)');
        const languageFlag = document.querySelector('.language-btn .lang-flag');

        if (languageBtn) {
            languageBtn.textContent = languageNames[lang] || 'English';
        }
        if (languageFlag) {
            languageFlag.textContent = languageFlags[lang] || '🇺🇸';
        }
    }

    showHelpModal() {
        const modal = this.createModal('help-modal', this.getHelpContent());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    showDocumentationModal() {
        const modal = this.createModal('documentation-modal', this.getDocumentationContent());
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    createModal(id, content) {
        // Remove existing modal if present
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Close button
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal(modal);
        });

        // Close on ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return modal;
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    getHelpContent() {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';

        const content = {
            en: `
                <h2><i class="fas fa-question-circle"></i> Help</h2>
                <div class="help-section">
                    <h3>Getting Started</h3>
                    <p>GearGen is a 3D gear generator that allows you to create custom gears with precise parameters.</p>
                    
                    <h3>How to Use</h3>
                    <ol>
                        <li><strong>Select Gear Type:</strong> Choose from available gear types (currently Spur Gear)</li>
                        <li><strong>Adjust Parameters:</strong> Use sliders or input fields to set dimensions</li>
                        <li><strong>Preview:</strong> View your gear in real-time 3D preview</li>
                        <li><strong>Export:</strong> Download your gear as STL file for 3D printing or CAD</li>
                    </ol>
                    
                    <h3>Key Parameters</h3>
                    <ul>
                        <li><strong>Module:</strong> Defines the size of gear teeth</li>
                        <li><strong>Number of Teeth:</strong> Total teeth count on the gear</li>
                        <li><strong>Pressure Angle:</strong> Angle affecting tooth strength and smoothness</li>
                        <li><strong>Face Width:</strong> Thickness of the gear</li>
                    </ul>
                    
                    <h3>Need More Help?</h3>
                    <p>Visit our <a href="https://github.com/JB07-198/GearGen-3D" target="_blank">GitHub repository</a> or contact us at <a href="mailto:contacte.baiha@gmail.com">contacte.baiha@gmail.com</a></p>
                </div>
            `,
            fr: `
                <h2><i class="fas fa-question-circle"></i> Aide</h2>
                <div class="help-section">
                    <h3>Démarrage</h3>
                    <p>GearGen est un générateur d'engrenages 3D qui vous permet de créer des engrenages personnalisés avec des paramètres précis.</p>
                    
                    <h3>Comment Utiliser</h3>
                    <ol>
                        <li><strong>Sélectionner le Type d'Engrenage :</strong> Choisissez parmi les types disponibles (actuellement Engrenage Droit)</li>
                        <li><strong>Ajuster les Paramètres :</strong> Utilisez les curseurs ou les champs de saisie pour définir les dimensions</li>
                        <li><strong>Aperçu :</strong> Visualisez votre engrenage en aperçu 3D en temps réel</li>
                        <li><strong>Exporter :</strong> Téléchargez votre engrenage au format STL pour l'impression 3D ou la CAO</li>
                    </ol>
                    
                    <h3>Paramètres Clés</h3>
                    <ul>
                        <li><strong>Module :</strong> Définit la taille des dents de l'engrenage</li>
                        <li><strong>Nombre de Dents :</strong> Nombre total de dents sur l'engrenage</li>
                        <li><strong>Angle de Pression :</strong> Angle affectant la résistance et la douceur des dents</li>
                        <li><strong>Largeur de Denture :</strong> Épaisseur de l'engrenage</li>
                    </ul>
                    
                    <h3>Besoin d'Aide Supplémentaire ?</h3>
                    <p>Visitez notre <a href="https://github.com/JB07-198/GearGen-3D" target="_blank">dépôt GitHub</a> ou contactez-nous à <a href="mailto:contacte.baiha@gmail.com">contacte.baiha@gmail.com</a></p>
                </div>
            `,
            ar: `
                <h2><i class="fas fa-question-circle"></i> مساعدة</h2>
                <div class="help-section">
                    <h3>البدء</h3>
                    <p>GearGen هو مولد تروس ثلاثي الأبعاد يتيح لك إنشاء تروس مخصصة بمعاملات دقيقة.</p>
                    
                    <h3>كيفية الاستخدام</h3>
                    <ol>
                        <li><strong>اختر نوع الترس:</strong> اختر من أنواع التروس المتاحة (حالياً الترس المستقيم)</li>
                        <li><strong>ضبط المعاملات:</strong> استخدم أشرطة التمرير أو حقول الإدخال لتعيين الأبعاد</li>
                        <li><strong>المعاينة:</strong> شاهد الترس الخاص بك في معاينة ثلاثية الأبعاد في الوقت الفعلي</li>
                        <li><strong>التصدير:</strong> قم بتنزيل الترس الخاص بك كملف STL للطباعة ثلاثية الأبعاد أو CAD</li>
                    </ol>
                    
                    <h3>المعاملات الرئيسية</h3>
                    <ul>
                        <li><strong>المعامل:</strong> يحدد حجم أسنان الترس</li>
                        <li><strong>عدد الأسنان:</strong> العدد الإجمالي للأسنان على الترس</li>
                        <li><strong>زاوية الضغط:</strong> الزاوية التي تؤثر على قوة الأسنان ونعومتها</li>
                        <li><strong>عرض الوجه:</strong> سمك الترس</li>
                    </ul>
                    
                    <h3>هل تحتاج إلى مزيد من المساعدة؟</h3>
                    <p>قم بزيارة <a href="https://github.com/JB07-198/GearGen-3D" target="_blank">مستودع GitHub</a> الخاص بنا أو اتصل بنا على <a href="mailto:contacte.baiha@gmail.com">contacte.baiha@gmail.com</a></p>
                </div>
            `
        };

        return content[lang] || content['en'];
    }

    getDocumentationContent() {
        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';

        const content = {
            en: `
                <h2><i class="fas fa-book"></i> Documentation</h2>
                <div class="documentation-section">
                    <h3>Gear Parameters Explained</h3>
                    
                    <h4>Module (m)</h4>
                    <p>The module is the fundamental size parameter of a gear. It represents the ratio of the pitch diameter to the number of teeth.</p>
                    <p><code>Module = Pitch Diameter / Number of Teeth</code></p>
                    
                    <h4>Pressure Angle (α)</h4>
                    <p>The pressure angle affects the tooth profile and determines the force transmission characteristics:</p>
                    <ul>
                        <li><strong>20°:</strong> Most common, good balance of strength and efficiency</li>
                        <li><strong>14.5°:</strong> Legacy standard, smoother but weaker</li>
                        <li><strong>25°:</strong> Higher load capacity, used in heavy-duty applications</li>
                    </ul>
                    
                    <h4>Calculated Values</h4>
                    <p><strong>Pitch Diameter:</strong> <code>d = m × z</code> (where z = number of teeth)</p>
                    <p><strong>Circular Pitch:</strong> <code>p = π × m</code></p>
                    <p><strong>Addendum:</strong> <code>a = m</code></p>
                    <p><strong>Dedendum:</strong> <code>b = 1.25 × m</code></p>
                    
                    <h3>Export Formats</h3>
                    <h4>STL (STereoLithography)</h4>
                    <p>STL is a widely supported format for 3D printing and CAD software. It represents the surface geometry as a collection of triangles.</p>
                    <p><strong>Best for:</strong> 3D printing, visual representation, basic CAD import</p>
                    
                    <h3>Technical Support</h3>
                    <p>For technical questions or issues, please visit our <a href="https://github.com/JB07-198/GearGen-3D/issues" target="_blank">GitHub Issues</a> page.</p>
                </div>
            `,
            fr: `
                <h2><i class="fas fa-book"></i> Documentation</h2>
                <div class="documentation-section">
                    <h3>Explication des Paramètres d'Engrenage</h3>
                    
                    <h4>Module (m)</h4>
                    <p>Le module est le paramètre de taille fondamental d'un engrenage. Il représente le rapport du diamètre primitif au nombre de dents.</p>
                    <p><code>Module = Diamètre Primitif / Nombre de Dents</code></p>
                    
                    <h4>Angle de Pression (α)</h4>
                    <p>L'angle de pression affecte le profil de la dent et détermine les caractéristiques de transmission de force :</p>
                    <ul>
                        <li><strong>20° :</strong> Le plus courant, bon équilibre entre résistance et efficacité</li>
                        <li><strong>14.5° :</strong> Norme ancienne, plus doux mais plus faible</li>
                        <li><strong>25° :</strong> Capacité de charge plus élevée, utilisé dans les applications lourdes</li>
                    </ul>
                    
                    <h4>Valeurs Calculées</h4>
                    <p><strong>Diamètre Primitif :</strong> <code>d = m × z</code> (où z = nombre de dents)</p>
                    <p><strong>Pas Circulaire :</strong> <code>p = π × m</code></p>
                    <p><strong>Saillie :</strong> <code>a = m</code></p>
                    <p><strong>Creux :</strong> <code>b = 1.25 × m</code></p>
                    
                    <h3>Formats d'Exportation</h3>
                    <h4>STL (STereoLithography)</h4>
                    <p>STL est un format largement pris en charge pour l'impression 3D et les logiciels CAO. Il représente la géométrie de surface comme une collection de triangles.</p>
                    <p><strong>Idéal pour :</strong> Impression 3D, représentation visuelle, importation CAO de base</p>
                    
                    <h3>Support Technique</h3>
                    <p>Pour des questions techniques ou des problèmes, veuillez visiter notre page <a href="https://github.com/JB07-198/GearGen-3D/issues" target="_blank">GitHub Issues</a>.</p>
                </div>
            `,
            ar: `
                <h2><i class="fas fa-book"></i> التوثيق</h2>
                <div class="documentation-section">
                    <h3>شرح معاملات الترس</h3>
                    
                    <h4>المعامل (m)</h4>
                    <p>المعامل هو معامل الحجم الأساسي للترس. يمثل نسبة القطر الأولي إلى عدد الأسنان.</p>
                    <p><code>المعامل = القطر الأولي / عدد الأسنان</code></p>
                    
                    <h4>زاوية الضغط (α)</h4>
                    <p>تؤثر زاوية الضغط على شكل السن وتحدد خصائص نقل القوة:</p>
                    <ul>
                        <li><strong>20°:</strong> الأكثر شيوعاً، توازن جيد بين القوة والكفاءة</li>
                        <li><strong>14.5°:</strong> معيار قديم، أكثر نعومة ولكن أضعف</li>
                        <li><strong>25°:</strong> قدرة تحمل أعلى، يستخدم في التطبيقات الثقيلة</li>
                    </ul>
                    
                    <h4>القيم المحسوبة</h4>
                    <p><strong>القطر الأولي:</strong> <code>d = m × z</code> (حيث z = عدد الأسنان)</p>
                    <p><strong>الخطوة الدائرية:</strong> <code>p = π × m</code></p>
                    <p><strong>الإضافة:</strong> <code>a = m</code></p>
                    <p><strong>النقص:</strong> <code>b = 1.25 × m</code></p>
                    
                    <h3>تنسيقات التصدير</h3>
                    <h4>STL (STereoLithography)</h4>
                    <p>STL هو تنسيق مدعوم على نطاق واسع للطباعة ثلاثية الأبعاد وبرامج CAD. يمثل هندسة السطح كمجموعة من المثلثات.</p>
                    <p><strong>الأفضل لـ:</strong> الطباعة ثلاثية الأبعاد، التمثيل المرئي، استيراد CAD الأساسي</p>
                    
                    <h3>الدعم الفني</h3>
                    <p>للأسئلة التقنية أو المشاكل، يرجى زيارة صفحة <a href="https://github.com/JB07-198/GearGen-3D/issues" target="_blank">GitHub Issues</a> الخاصة بنا.</p>
                </div>
            `
        };

        return content[lang] || content['en'];
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});
