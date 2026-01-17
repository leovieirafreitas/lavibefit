export type SeoIssue = {
    severity: 'critical' | 'warning' | 'info';
    message: string;
    field?: string;
};

export type SeoScore = {
    score: number;
    issues: SeoIssue[];
};

export const runSeoAudit = (product: any, focusKeyword?: string): SeoScore => {
    const issues: SeoIssue[] = [];
    let score = 100;

    // 1. Title Analysis
    if (!product.name) {
        issues.push({ severity: 'critical', message: 'Produto sem nome (H1).', field: 'name' });
        score -= 50;
    } else {
        if (product.name.length < 20) {
            issues.push({ severity: 'warning', message: 'Nome muito curto. Use pelo menos 20 caracteres.', field: 'name' });
            score -= 10;
        }
        if (focusKeyword && !product.name.toLowerCase().includes(focusKeyword.toLowerCase())) {
            issues.push({ severity: 'warning', message: 'Palavra-chave foco não encontrada no nome.', field: 'name' });
            score -= 15;
        }
    }

    // 2. Description Analysis
    if (!product.description) {
        issues.push({ severity: 'critical', message: 'Produto sem descrição.', field: 'description' });
        score -= 30;
    } else {
        const descLen = product.description.length;
        if (descLen < 100) {
            issues.push({ severity: 'warning', message: `Descrição muito curta (${descLen} chars). O ideal é 300+ chars para ranquear.`, field: 'description' });
            score -= 20;
        } else if (descLen < 300) {
            issues.push({ severity: 'info', message: 'Descrição poderia ser mais detalhada (>300 caracteres).', field: 'description' });
            score -= 5;
        }

        if (focusKeyword && !product.description.toLowerCase().includes(focusKeyword.toLowerCase())) {
            issues.push({ severity: 'warning', message: 'Palavra-chave foco não encontrada na descrição.', field: 'description' });
            score -= 15;
        }
    }

    // 3. Image Analysis
    if (!product.image_url) {
        issues.push({ severity: 'critical', message: 'Produto sem imagem principal.', field: 'image_url' });
        score -= 20;
    }

    // 4. URL/Slug Check (Simulated)
    // Assuming slug is derived from name, checking for special chars issues theoretically
    if (product.name && /[^a-zA-Z0-9\s-]/.test(product.name)) {
        // This is lenient, but warns about potential URL weirdness if slug logic isn't robust
        // issues.push({ severity: 'info', message: 'Nome contém caracteres especiais. Verifique se a URL (slug) está limpa.', field: 'name' });
    }

    return {
        score: Math.max(0, score),
        issues
    };
};
