// Internationalization (i18n) System
class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.translations = {
            en: {
                // Headers (Logo/Slogan kept in English in HTML)
                'btn.help': 'Help',
                'btn.github': 'GitHub',
                'btn.reset': 'Reset',

                // Gear Types
                'section.gearType': 'Gear Type',
                'gear.spur': 'Spur Gear',
                'gear.spur.desc': 'Straight teeth parallel to axis',
                'gear.helical': 'Helical Gear',
                'gear.helical.desc': 'Angled teeth for smoother operation',
                'gear.bevel': 'Bevel Gear',
                'gear.bevel.desc': 'Conical shape for right-angle drive',
                'gear.worm': 'Worm Gear',
                'gear.worm.desc': 'Screw-like gear for high reduction',
                'gear.rack': 'Rack Gear',
                'gear.rack.desc': 'Linear gear for conversion',
                'gear.internal': 'Internal Gear',
                'gear.internal.desc': 'Teeth on the inside surface',
                'gear.planetary': 'Planetary Gear',
                'gear.planetary.desc': 'Multiple gears in planetary system',
                'status.available': 'Available',
                'status.comingSoon': 'Coming Soon',

                // 3D Preview
                'section.preview': '3D Preview',
                'btn.resetView': 'Reset View',
                'btn.grid': 'Grid',
                'btn.axis': 'Axis',
                'btn.wireframe': 'Wireframe',
                'stats.vertices': 'Vertices:',
                'stats.faces': 'Faces:',
                'stats.size': 'Size:',

                // Parameters
                'section.parameters': 'Parameters',
                'group.basicDimensions': 'Basic Dimensions',
                'param.module': 'Module (mm)',
                'param.module.tooltip': 'Size of teeth (pitch diameter / teeth count)',
                'param.teeth': 'Number of Teeth',
                'param.teeth.tooltip': 'Total number of teeth on the gear',
                'param.pressureAngle': 'Pressure Angle (°)',
                'param.pressureAngle.tooltip': 'Angle between tooth face and gear wheel tangent',
                'param.pressureAngle.common': '20° (Common)',
                'param.pressureAngle.legacy': '14.5° (Legacy)',
                'param.pressureAngle.highLoad': '25° (High Load)',
                'param.helixAngle': 'Helix Angle (°)',
                'param.helixAngle.tooltip': 'The angle of the teeth relative to the gear axis',

                'group.gearBody': 'Gear Body',
                'param.faceWidth': 'Face Width (mm)',
                'param.faceWidth.tooltip': 'Thickness of the gear',
                'param.hubDiameter': 'Hub Diameter (mm)',
                'param.hubDiameter.tooltip': 'Diameter of the central hub',
                'param.boreDiameter': 'Bore Diameter (mm)',
                'param.boreDiameter.tooltip': 'Diameter of the central hole',

                'group.appearance': 'Appearance',
                'param.color': 'Gear Color',
                'param.quality': 'Mesh Quality',
                'param.quality.low': 'Low (Fast)',
                'param.quality.medium': 'Medium (Recommended)',
                'param.quality.high': 'High (Detailed)',

                // Export
                'section.export': 'Export',
                'btn.downloadSTL': 'Download STL',
                'export.stl.title': 'STL Format:',
                'export.stl.desc': 'The STL file is sufficient for:',
                'export.stl.use1': '3D Printing',
                'export.stl.use2': 'Assembly',
                'export.stl.use3': 'CAD Soft',
                'export.stl.use4': 'Simulation',
                'export.note.title': 'Note:',
                'export.note.desc': 'We are developing free offline software for complex gears and more formats (STEP, IGES, etc.).',

                // Info Notice
                'info.notice': 'Currently <strong>Spur</strong> and <strong>Helical</strong> gears are available. More types coming soon.',

                // Footer
                'footer.copyright': 'GearGen - 3D Gear Generator © 2026',
                'footer.documentation': 'Documentation',
                'footer.reportIssue': 'Report Issue',
                'footer.contact': 'Contact',

                // Calculated Values
                'calc.pitchDiameter': 'Pitch Diameter',
                'calc.circularPitch': 'Circular Pitch'
            },

            fr: {
                // Header
                'btn.help': 'Aide',
                'btn.github': 'GitHub',
                'btn.reset': 'Réinitialiser',

                // Gear Types
                'section.gearType': 'Type d\'Engrenage',
                'gear.spur': 'Engrenage Droit',
                'gear.spur.desc': 'Dents droites parallèles à l\'axe',
                'gear.helical': 'Engrenage Hélicoïdal',
                'gear.helical.desc': 'Dents inclinées pour un fonctionnement plus doux',
                'gear.bevel': 'Engrenage Conique',
                'gear.bevel.desc': 'Forme conique pour transmission à angle droit',
                'gear.worm': 'Roue et Vis Sans Fin',
                'gear.worm.desc': 'Engrenage en forme de vis pour réduction élevée',
                'gear.rack': 'Crémaillère',
                'gear.rack.desc': 'Engrenage linéaire pour conversion',
                'gear.internal': 'Engrenage Intérieur',
                'gear.internal.desc': 'Dents sur la surface intérieure',
                'gear.planetary': 'Engrenage Planétaire',
                'gear.planetary.desc': 'Plusieurs engrenages en système planétaire',
                'status.available': 'Disponible',
                'status.comingSoon': 'Bientôt Disponible',

                // 3D Preview
                'section.preview': 'Aperçu 3D',
                'btn.resetView': 'Réinitialiser la Vue',
                'btn.grid': 'Grille',
                'btn.axis': 'Axes',
                'btn.wireframe': 'Fil de Fer',
                'stats.vertices': 'Sommets :',
                'stats.faces': 'Faces :',
                'stats.size': 'Taille :',

                // Parameters
                'section.parameters': 'Paramètres',
                'group.basicDimensions': 'Dimensions de Base',
                'param.module': 'Module (mm)',
                'param.module.tooltip': 'Taille des dents (diamètre primitif / nombre de dents)',
                'param.teeth': 'Nombre de Dents',
                'param.teeth.tooltip': 'Nombre total de dents sur l\'engrenage',
                'param.pressureAngle': 'Angle de Pression (°)',
                'param.pressureAngle.tooltip': 'Angle entre la face de la dent et la tangente de la roue',
                'param.pressureAngle.common': '20° (Standard)',
                'param.pressureAngle.legacy': '14,5° (Ancien)',
                'param.pressureAngle.highLoad': '25° (Charge Élevée)',
                'param.helixAngle': 'Angle d\'Hélice (°)',
                'param.helixAngle.tooltip': 'L\'inclinaison des dents par rapport à l\'axe de l\'engrenage',

                'group.gearBody': 'Corps de l\'Engrenage',
                'param.faceWidth': 'Largeur de Denture (mm)',
                'param.faceWidth.tooltip': 'Épaisseur de l\'engrenage',
                'param.hubDiameter': 'Diamètre du Moyeu (mm)',
                'param.hubDiameter.tooltip': 'Diamètre du moyeu central',
                'param.boreDiameter': 'Diamètre d\'Alésage (mm)',
                'param.boreDiameter.tooltip': 'Diamètre du trou central',

                'group.appearance': 'Apparence',
                'param.color': 'Couleur de l\'Engrenage',
                'param.quality': 'Qualité du Maillage',
                'param.quality.low': 'Basse (Rapide)',
                'param.quality.medium': 'Moyenne (Recommandée)',
                'param.quality.high': 'Haute (Détaillée)',

                // Export
                'section.export': 'Exportation',
                'btn.downloadSTL': 'Télécharger STL',
                'export.stl.title': 'Format STL :',
                'export.stl.desc': 'Le fichier STL est suffisant pour :',
                'export.stl.use1': 'Impression 3D',
                'export.stl.use2': 'Assemblage',
                'export.stl.use3': 'Logiciel CAO',
                'export.stl.use4': 'Simulation',
                'export.note.title': 'Note :',
                'export.note.desc': 'Logiciel gratuit en cours pour engrenages complexes et plus de formats (STEP, IGES, etc.).',

                // Info Notice
                'info.notice': 'Actuellement, les engrenages <strong>Droits</strong> et <strong>Hélicoïdaux</strong> sont disponibles. D\'autres types suivront.',

                // Footer
                'footer.copyright': 'GearGen - Générateur d\'Engrenages 3D © 2026',
                'footer.documentation': 'Documentation',
                'footer.reportIssue': 'Signaler un Problème',
                'footer.contact': 'Contact',

                // Calculated Values
                'calc.pitchDiameter': 'Diamètre Primitif',
                'calc.circularPitch': 'Pas Circulaire'
            },

            ar: {
                // Header
                'btn.help': 'مساعدة',
                'btn.github': 'GitHub',
                'btn.reset': 'إعادة تعيين',

                // Gear Types
                'section.gearType': 'نوع الترس',
                'gear.spur': 'ترس مستقيم',
                'gear.spur.desc': 'أسنان مستقيمة موازية للمحور',
                'gear.helical': 'ترس حلزوني',
                'gear.helical.desc': 'أسنان مائلة لتشغيل أكثر سلاسة',
                'gear.bevel': 'ترس مخروطي',
                'gear.bevel.desc': 'شكل مخروطي للدفع بزاوية قائمة',
                'gear.worm': 'ترس دودي',
                'gear.worm.desc': 'ترس يشبه البرغي للتخفيض العالي',
                'gear.rack': 'ترس رف',
                'gear.rack.desc': 'ترس خطي للتحويل',
                'gear.internal': 'ترس داخلي',
                'gear.internal.desc': 'أسنان على السطح الداخلي',
                'gear.planetary': 'ترس كوكبي',
                'gear.planetary.desc': 'تروس متعددة في نظام كوكبي',
                'status.available': 'متاح',
                'status.comingSoon': 'قريباً',

                // 3D Preview
                'section.preview': 'معاينة ثلاثية الأبعاد',
                'btn.resetView': 'إعادة تعيين العرض',
                'btn.grid': 'الشبكة',
                'btn.axis': 'المحاور',
                'btn.wireframe': 'الإطار السلكي',
                'stats.vertices': 'الرؤوس:',
                'stats.faces': 'الوجوه:',
                'stats.size': 'الحجم:',

                // Parameters
                'section.parameters': 'المعاملات',
                'group.basicDimensions': 'الأبعاد الأساسية',
                'param.module': 'المعامل (مم)',
                'param.module.tooltip': 'حجم الأسنان (القطر الأولي / عدد الأسنان)',
                'param.teeth': 'عدد الأسنان',
                'param.teeth.tooltip': 'العدد الإجمالي للأسنان على الترس',
                'param.pressureAngle': 'زاوية الضغط (°)',
                'param.pressureAngle.tooltip': 'الزاوية بين وجه السن ومماس عجلة الترس',
                'param.pressureAngle.common': '20° (شائع)',
                'param.pressureAngle.legacy': '14.5° (قديم)',
                'param.pressureAngle.highLoad': '25° (حمل عالي)',
                'param.helixAngle': 'زاوية الحلزون (°)',
                'param.helixAngle.tooltip': 'زاوية الأسنان بالنسبة لمحور الترس',

                'group.gearBody': 'جسم الترس',
                'param.faceWidth': 'عرض الوجه (مم)',
                'param.faceWidth.tooltip': 'سمك الترس',
                'param.hubDiameter': 'قطر المحور (مم)',
                'param.hubDiameter.tooltip': 'قطر المحور المركزي',
                'param.boreDiameter': 'قطر الثقب (مم)',
                'param.boreDiameter.tooltip': 'قطر الفتحة المركزية',

                'group.appearance': 'المظهر',
                'param.color': 'لون الترس',
                'param.quality': 'جودة الشبكة',
                'param.quality.low': 'منخفضة (سريع)',
                'param.quality.medium': 'متوسطة (موصى بها)',
                'param.quality.high': 'عالية (مفصلة)',

                // Export
                'section.export': 'تصدير',
                'btn.downloadSTL': 'تنزيل STL',
                'export.stl.title': 'تنسيق STL:',
                'export.stl.desc': 'ملف STL كافٍ لـ:',
                'export.stl.use1': 'طباعة ثلاثية الأبعاد',
                'export.stl.use2': 'تجميع ميكانيكي',
                'export.stl.use3': 'برامج CAD',
                'export.stl.use4': 'محاكاة',
                'export.note.title': 'ملاحظة:',
                'export.note.desc': 'نحن نطور برنامجاً مجانياً للتروس المعقدة وتنسيقات إضافية (STEP، IGES، إلخ).',

                // Info Notice
                'info.notice': 'حالياً تتوفر التروس <strong>المستقيمة</strong> و <strong>الحلزونية</strong>. المزيد من الأنواع قريباً.',

                // Footer
                'footer.copyright': 'GearGen - مولد التروس ثلاثية الأبعاد © 2026',
                'footer.documentation': 'التوثيق',
                'footer.reportIssue': 'الإبلاغ عن مشكلة',
                'footer.contact': 'اتصل بنا',

                // Calculated Values
                'calc.pitchDiameter': 'القطر الأولي',
                'calc.circularPitch': 'الخطوة الدائرية'
            }
        };

        this.init();
    }

    init() {
        console.log('Initializing i18n system...');
        this.applyLanguage(this.currentLanguage);
    }

    getStoredLanguage() {
        try {
            return localStorage.getItem('geargen-language');
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    setStoredLanguage(lang) {
        try {
            localStorage.setItem('geargen-language', lang);
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
    }

    translate(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        return translation || this.translations['en'][key] || key;
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language ${lang} not found, falling back to English`);
            lang = 'en';
        }

        this.currentLanguage = lang;
        this.setStoredLanguage(lang);

        // Apply RTL for Arabic
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);

            // Check if element has data-i18n-html attribute for HTML content
            if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.translate(key);
        });

        // Update title attributes (tooltips)
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });

        // Trigger custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));

        console.log(`Language changed to: ${lang}`);
    }

    switchLanguage(lang) {
        this.applyLanguage(lang);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// Initialize i18n system
window.i18n = new I18n();
