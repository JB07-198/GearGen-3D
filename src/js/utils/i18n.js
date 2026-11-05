// ==========================================================================
// GearGen-3D Internationalization (i18n) System
// EN, FR, AR Support with localStorage Persistence and RTL Switching
// ==========================================================================

class I18n {
    constructor() {
        this.storageKey = 'geargen-language';
        this.supportedLanguages = ['en', 'fr', 'ar'];
        this.rtlLanguages = ['ar'];
        this.currentLanguage = this.getStoredLanguage() || 'en';

        this.translations = {
            en: {
                // Header & Branding
                'branding.tagline': 'Parametric 3D Gear Generator',
                'btn.help': 'Help',
                'btn.github': 'GitHub',
                'btn.reset': 'Reset',

                // Top Menu Bar
                'menu.file': 'File',
                'menu.file.reset': 'Reset All Parameters',
                'menu.file.exportStl': 'Export STL...',
                'menu.file.exportStep': 'Export STEP...',
                'menu.file.exportDxf': 'Export DXF (2D)...',
                'menu.file.exportConfig': 'Export Config JSON',
                'menu.file.importConfig': 'Import Config JSON',
                'menu.edit': 'Edit',
                'menu.edit.resetBasic': 'Reset Basic Dimensions',
                'menu.edit.resetBody': 'Reset Gear Body',
                'menu.edit.resetAppearance': 'Reset Appearance',
                'menu.view': 'View',
                'menu.view.iso': 'Isometric View',
                'menu.view.top': 'Top View',
                'menu.view.front': 'Front View',
                'menu.view.side': 'Side View',
                'menu.view.reset': 'Reset Camera',
                'menu.view.grid': 'Toggle Grid',
                'menu.view.axis': 'Toggle Axis',
                'menu.view.wireframe': 'Toggle Wireframe',
                'menu.help': 'Help',
                'menu.help.help': 'Help',
                'menu.help.docs': 'Documentation',
                'menu.help.report': 'Report Issue',
                'menu.help.contact': 'Contact',
                'menu.help.github': 'GitHub',

                // Left Panel: Gear Types
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
                'gear.internal.desc': 'Teeth on inside surface',
                'gear.planetary': 'Planetary Gear',
                'gear.planetary.desc': 'Sun, planets & ring assembly',

                // Center Viewport: Floating Toolbar Tooltips
                'section.preview': '3D Preview',
                'toolbar.reset': 'Reset View (0)',
                'toolbar.iso': 'Isometric (R)',
                'toolbar.top': 'Top View (1)',
                'toolbar.front': 'Front View (2)',
                'toolbar.side': 'Side View (3)',
                'toolbar.zoomIn': 'Zoom In (+)',
                'toolbar.zoomOut': 'Zoom Out (-)',
                'toolbar.grid': 'Grid (G)',
                'toolbar.axis': 'Axis (A)',
                'toolbar.wireframe': 'Wireframe (W)',

                // Mesh Statistics
                'stats.vertices': 'Vertices',
                'stats.faces': 'Faces',
                'stats.size': 'Bounding Box',

                // Right Panel: Parameters
                'section.parameters': 'Parameters',
                'group.basicDimensions': 'Basic Dimensions',
                'param.module': 'Module (mm)',
                'param.module.desc': 'Pitch diameter / teeth count ratio',
                'param.teeth': 'Number of Teeth',
                'param.teeth.desc': 'Total tooth count on the gear',
                'param.planetTeeth': 'Planet Teeth',
                'param.planetTeeth.desc': 'Number of teeth on planet gears',
                'param.planetCount': 'Planet Count',
                'param.planetCount.desc': 'Number of planet gears in assembly',
                'param.helixAngle': 'Helix Angle (°)',
                'param.helixAngle.desc': 'Angle of teeth relative to axis',
                'param.pitchAngle': 'Pitch Angle (°)',
                'param.pitchAngle.desc': 'Angle of the pitch cone',
                'param.pressureAngle': 'Pressure Angle (°)',
                'param.pressureAngle.desc': 'Tooth profile standard angle',

                'group.gearBody': 'Gear Body',
                'param.faceWidth': 'Face Width (mm)',
                'param.faceWidth.desc': 'Thickness of the gear rim',
                'param.hubDiameter': 'Hub Diameter (mm)',
                'param.hubDiameter.desc': 'Diameter of central mounting hub',
                'param.boreDiameter': 'Bore Diameter (mm)',
                'param.boreDiameter.desc': 'Diameter of center shaft hole',

                'group.appearance': 'Appearance',
                'param.color': 'Gear Color',
                'param.quality': 'Mesh Quality',
                'param.quality.low': 'Low (Fast)',
                'param.quality.medium': 'Medium (Recommended)',
                'param.quality.high': 'High (Detailed)',

                // Calculated KPIs
                'calc.pitchDiameter': 'Pitch Diameter',
                'calc.circularPitch': 'Circular Pitch',

                // Export Modal & Mobile
                'section.export': 'Export',
                'modal.export.title': 'Export 3D Model',
                'modal.export.gear': 'Gear Model',
                'modal.export.stl': 'Download STL',
                'modal.export.step': 'Download STEP',
                'modal.export.stlDesc': 'Binary STL format. Optimal for 3D printing and slicers.',
                'modal.export.stepDesc': 'Faceted B-Rep STEP (AP214). Suitable for mechanical CAD.',
                'modal.export.dxf': 'Download DXF',
                'modal.export.dxfDesc': '2D involute profile with central bore. Ready for laser cutting and CNC milling.',
                'modal.export.estimatedSize': 'Estimated File Size',
                'modal.export.noMesh': 'No 3D mesh currently available to export.',
                'export.dxfSpurOnly': 'DXF export is only available for spur gears.',
                'export.success': 'File downloaded successfully:'
            },

            fr: {
                // Header & Branding
                'branding.tagline': 'Générateur d\'Engrenages 3D Paramétrique',
                'btn.help': 'Aide',
                'btn.github': 'GitHub',
                'btn.reset': 'Réinitialiser',

                // Top Menu Bar
                'menu.file': 'Fichier',
                'menu.file.reset': 'Réinitialiser tous les paramètres',
                'menu.file.exportStl': 'Exporter STL...',
                'menu.file.exportStep': 'Exporter STEP...',
                'menu.file.exportDxf': 'Exporter DXF (2D)...',
                'menu.file.exportConfig': 'Exporter la config JSON',
                'menu.file.importConfig': 'Importer la config JSON',
                'menu.edit': 'Édition',
                'menu.edit.resetBasic': 'Réinitialiser dimensions de base',
                'menu.edit.resetBody': 'Réinitialiser corps d\'engrenage',
                'menu.edit.resetAppearance': 'Réinitialiser apparence',
                'menu.view': 'Affichage',
                'menu.view.iso': 'Vue Isométrique',
                'menu.view.top': 'Vue de Dessus',
                'menu.view.front': 'Vue de Face',
                'menu.view.side': 'Vue de Côté',
                'menu.view.reset': 'Réinitialiser Caméra',
                'menu.view.grid': 'Basculer Grille',
                'menu.view.axis': 'Basculer Axes',
                'menu.view.wireframe': 'Basculer Fil de Fer',
                'menu.help': 'Aide',
                'menu.help.help': 'Aide',
                'menu.help.docs': 'Documentation',
                'menu.help.report': 'Signaler un Problème',
                'menu.help.contact': 'Contact',
                'menu.help.github': 'GitHub',

                // Left Panel: Gear Types
                'section.gearType': 'Type d\'Engrenage',
                'gear.spur': 'Engrenage Droit',
                'gear.spur.desc': 'Dents droites parallèles à l\'axe',
                'gear.helical': 'Engrenage Hélicoïdal',
                'gear.helical.desc': 'Dents inclinées pour un fonctionnement doux',
                'gear.bevel': 'Engrenage Conique',
                'gear.bevel.desc': 'Forme conique pour renvoi d\'angle',
                'gear.worm': 'Roue et Vis Sans Fin',
                'gear.worm.desc': 'Vis sans fin à grand rapport de réduction',
                'gear.rack': 'Crémaillère',
                'gear.rack.desc': 'Engrenage linéaire de conversion',
                'gear.internal': 'Engrenage Intérieur',
                'gear.internal.desc': 'Denture sur surface intérieure',
                'gear.planetary': 'Train Épicycloïdal',
                'gear.planetary.desc': 'Solaire, satellites et couronne',

                // Center Viewport
                'section.preview': 'Aperçu 3D',
                'toolbar.reset': 'Réinitialiser Vue (0)',
                'toolbar.iso': 'Isométrique (R)',
                'toolbar.top': 'Vue de Dessus (1)',
                'toolbar.front': 'Vue de Face (2)',
                'toolbar.side': 'Vue de Côté (3)',
                'toolbar.zoomIn': 'Zoom Avant (+)',
                'toolbar.zoomOut': 'Zoom Arrière (-)',
                'toolbar.grid': 'Grille (G)',
                'toolbar.axis': 'Axes (A)',
                'toolbar.wireframe': 'Fil de Fer (W)',

                // Mesh Statistics
                'stats.vertices': 'Sommets',
                'stats.faces': 'Faces',
                'stats.size': 'Dimensions',

                // Right Panel: Parameters
                'section.parameters': 'Paramètres',
                'group.basicDimensions': 'Dimensions de Base',
                'param.module': 'Module (mm)',
                'param.module.desc': 'Rapport diamètre primitif / nombre de dents',
                'param.teeth': 'Nombre de Dents',
                'param.teeth.desc': 'Nombre total de dents sur l\'engrenage',
                'param.planetTeeth': 'Dents Satellites',
                'param.planetTeeth.desc': 'Nombre de dents par satellite',
                'param.planetCount': 'Nombre de Satellites',
                'param.planetCount.desc': 'Quantité de satellites dans l\'ensemble',
                'param.helixAngle': 'Angle d\'Hélice (°)',
                'param.helixAngle.desc': 'Angle des dents par rapport à l\'axe',
                'param.pitchAngle': 'Angle Primitif (°)',
                'param.pitchAngle.desc': 'Angle du cône primitif',
                'param.pressureAngle': 'Angle de Pression (°)',
                'param.pressureAngle.desc': 'Profil standard d\'engrènement',

                'group.gearBody': 'Corps de l\'Engrenage',
                'param.faceWidth': 'Largeur de Denture (mm)',
                'param.faceWidth.desc': 'Épaisseur de la couronne d\'engrenage',
                'param.hubDiameter': 'Diamètre du Moyeu (mm)',
                'param.hubDiameter.desc': 'Diamètre du moyeu central',
                'param.boreDiameter': 'Diamètre d\'Alésage (mm)',
                'param.boreDiameter.desc': 'Diamètre du trou d\'arbre central',

                'group.appearance': 'Apparence',
                'param.color': 'Couleur de l\'Engrenage',
                'param.quality': 'Qualité du Maillage',
                'param.quality.low': 'Basse (Rapide)',
                'param.quality.medium': 'Moyenne (Recommandée)',
                'param.quality.high': 'Haute (Détaillée)',

                // Calculated KPIs
                'calc.pitchDiameter': 'Diamètre Primitif',
                'calc.circularPitch': 'Pas Circulaire',

                // Export Modal & Mobile
                'section.export': 'Exporter',
                'modal.export.title': 'Exporter le Modèle 3D',
                'modal.export.gear': 'Modèle d\'Engrenage',
                'modal.export.stl': 'Télécharger STL',
                'modal.export.step': 'Télécharger STEP',
                'modal.export.stlDesc': 'Format STL binaire. Recommandé pour l\'impression 3D.',
                'modal.export.stepDesc': 'Format STEP B-Rep facetté (AP214). Adapté aux logiciels CAO.',
                'modal.export.dxf': 'Télécharger DXF',
                'modal.export.dxfDesc': 'Profil 2D en développante avec alésage central. Prêt pour la découpe laser et le fraisage CNC.',
                'modal.export.estimatedSize': 'Taille estimée du fichier',
                'modal.export.noMesh': 'Aucun maillage 3D à exporter pour le moment.',
                'export.dxfSpurOnly': 'L\'export DXF est uniquement disponible pour les engrenages droits.',
                'export.success': 'Fichier téléchargé avec succès :'
            },

            ar: {
                // Header & Branding
                'branding.tagline': 'مولد التروس ثلاثية الأبعاد البارامتري',
                'btn.help': 'مساعدة',
                'btn.github': 'GitHub',
                'btn.reset': 'إعادة تعيين',

                // Top Menu Bar
                'menu.file': 'ملف',
                'menu.file.reset': 'إعادة تعيين كافة المعاملات',
                'menu.file.exportStl': '...STL تصدير',
                'menu.file.exportStep': '...STEP تصدير',
                'menu.file.exportDxf': '...DXF (2D) تصدير',
                'menu.file.exportConfig': '...JSON تصدير الإعدادات',
                'menu.file.importConfig': '...JSON استيراد الإعدادات',
                'menu.edit': 'تعديل',
                'menu.edit.resetBasic': 'إعادة تعيين الأبعاد الأساسية',
                'menu.edit.resetBody': 'إعادة تعيين جسم الترس',
                'menu.edit.resetAppearance': 'إعادة تعيين المظهر',
                'menu.view': 'عرض',
                'menu.view.iso': 'منظور متساوي القياس',
                'menu.view.top': 'عرض علوي',
                'menu.view.front': 'عرض أمامي',
                'menu.view.side': 'عرض جانبي',
                'menu.view.reset': 'إعادة ضبط الكاميرا',
                'menu.view.grid': 'تبديل الشبكة',
                'menu.view.axis': 'تبديل المحاور',
                'menu.view.wireframe': 'تبديل الإطار السلكي',
                'menu.help': 'مساعدة',
                'menu.help.help': 'مساعدة',
                'menu.help.docs': 'التوثيق',
                'menu.help.report': 'الإبلاغ عن مشكلة',
                'menu.help.contact': 'اتصل بنا',
                'menu.help.github': 'GitHub',

                // Left Panel: Gear Types
                'section.gearType': 'نوع الترس',
                'gear.spur': 'ترس مستقيم',
                'gear.spur.desc': 'أسنان مستقيمة موازية للمحور',
                'gear.helical': 'ترس حلزوني',
                'gear.helical.desc': 'أسنان مائلة لتشغيل سلس وهادئ',
                'gear.bevel': 'ترس مخروطي',
                'gear.bevel.desc': 'شكل مخروطي لنقل الحركة بزاوية',
                'gear.worm': 'ترس دودي',
                'gear.worm.desc': 'ترس لولبي لنسب تخفيض عالية',
                'gear.rack': 'ترس جريدة مسننة',
                'gear.rack.desc': 'ترس خطي لتحويل الحركة',
                'gear.internal': 'ترس داخلي',
                'gear.internal.desc': 'أسنان على السطح الداخلي',
                'gear.planetary': 'مجموعة كوكبية',
                'gear.planetary.desc': 'ترس شمسي، كواكب وترس حلقي',

                // Center Viewport
                'section.preview': 'معاينة ثلاثية الأبعاد',
                'toolbar.reset': 'إعادة ضبط العرض (0)',
                'toolbar.iso': 'متساوي القياس (R)',
                'toolbar.top': 'عرض علوي (1)',
                'toolbar.front': 'عرض أمامي (2)',
                'toolbar.side': 'عرض جانبي (3)',
                'toolbar.zoomIn': 'تكبير (+)',
                'toolbar.zoomOut': 'تصغير (-)',
                'toolbar.grid': 'الشبكة (G)',
                'toolbar.axis': 'المحاور (A)',
                'toolbar.wireframe': 'الإطار السلكي (W)',

                // Mesh Statistics
                'stats.vertices': 'الرؤوس',
                'stats.faces': 'الوجوه',
                'stats.size': 'الأبعاد',

                // Right Panel: Parameters
                'section.parameters': 'المعاملات',
                'group.basicDimensions': 'الأبعاد الأساسية',
                'param.module': 'المعامل (مم)',
                'param.module.desc': 'نسبة القطر الأولي إلى عدد الأسنان',
                'param.teeth': 'عدد الأسنان',
                'param.teeth.desc': 'العدد الإجمالي لأسنان الترس',
                'param.planetTeeth': 'أسنان الكواكب',
                'param.planetTeeth.desc': 'عدد الأسنان على كل ترس كوكبي',
                'param.planetCount': 'عدد الكواكب',
                'param.planetCount.desc': 'عدد التروس الكوكبية في النظام',
                'param.helixAngle': 'زاوية الحلزون (°)',
                'param.helixAngle.desc': 'زاوية ميل الأسنان بالنسبة للمحور',
                'param.pitchAngle': 'زاوية الخطوة (°)',
                'param.pitchAngle.desc': 'زاوية مخروط الخطوة',
                'param.pressureAngle': 'زاوية الضغط (°)',
                'param.pressureAngle.desc': 'الزاوية القياسية لشكل السن',

                'group.gearBody': 'جسم الترس',
                'param.faceWidth': 'عرض الوجه (مم)',
                'param.faceWidth.desc': 'سُمك حافة الترس',
                'param.hubDiameter': 'قطر المحور (مم)',
                'param.hubDiameter.desc': 'قطر المحور المركزي',
                'param.boreDiameter': 'قطر الثقب (مم)',
                'param.boreDiameter.desc': 'قطر فتحة العمود المركزي',

                'group.appearance': 'المظهر',
                'param.color': 'لون الترس',
                'param.quality': 'جودة الشبكة',
                'param.quality.low': 'منخفضة (سريع)',
                'param.quality.medium': 'متوسطة (موصى بها)',
                'param.quality.high': 'عالية (مفصلة)',

                // Calculated KPIs
                'calc.pitchDiameter': 'القطر الأولي',
                'calc.circularPitch': 'الخطوة الدائرية',

                // Export Modal & Mobile
                'section.export': 'تصدير',
                'modal.export.title': 'تصدير النموذج ثلاثي الأبعاد',
                'modal.export.gear': 'نموذج الترس',
                'modal.export.stl': 'STL تنزيل',
                'modal.export.step': 'STEP تنزيل',
                'modal.export.stlDesc': 'تنسيق STL ثنائي مثالي للطباعة ثلاثية الأبعاد.',
                'modal.export.stepDesc': 'تنسيق STEP B-Rep ملائم لبرامج الهندسة الميكانيكية.',
                'modal.export.dxf': 'DXF تنزيل',
                'modal.export.dxfDesc': 'مقطع ثنائي الأبعاد بمنحنى تطوري مع تجويف مركزي. جاهز للقطع بالليزر والتفريز باستخدام الحاسوب.',
                'modal.export.estimatedSize': 'الحجم المقدر للملف',
                'modal.export.noMesh': 'لا يتوفر نموذج حالياً للتصدير.',
                'export.dxfSpurOnly': 'تصدير DXF متاح فقط للتروس المستقيمة.',
                'export.success': 'تم تنزيل الملف بنجاح:'
            }
        };

        this.init();
    }

    init() {
        this.applyLanguage(this.currentLanguage);
    }

    getStoredLanguage() {
        try {
            const lang = localStorage.getItem(this.storageKey);
            return this.supportedLanguages.includes(lang) ? lang : null;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    setStoredLanguage(lang) {
        try {
            localStorage.setItem(this.storageKey, lang);
        } catch (e) {
            console.warn('localStorage not available:', e);
        }
    }

    translate(key) {
        const langData = this.translations[this.currentLanguage] || this.translations['en'];
        return langData[key] || this.translations['en'][key] || key;
    }

    applyLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            lang = 'en';
        }

        this.currentLanguage = lang;
        this.setStoredLanguage(lang);

        const isRtl = this.rtlLanguages.includes(lang);
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.translate(key);
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Update titles / tooltips
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', this.translate(key));
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.translate(key);
        });

        // Notify navigation switcher and other components
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang, isRtl } }));
    }

    switchLanguage(lang) {
        this.applyLanguage(lang);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize global i18n
window.i18n = new I18n();
