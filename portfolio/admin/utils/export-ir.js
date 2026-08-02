/**
 * Export IR - Format-neutral intermediate representation for exports.
 *
 * Single source of truth for export CONTENT decisions:
 *   - which sections appear, in which order (cover page and cover letter
 *     are sections too)
 *   - which fields of each data record are emitted, in which order
 *   - which labels are attached (delegated to window.ExportContent)
 *   - localized inline strings (confidentiality notice, table headers, ...)
 *
 * The PDF and DOCX exporters consume this tree and only decide PRESENTATION:
 * theme colors, typography, spacing, per-format decoration (joiners,
 * brackets, bullet markers) and pagination primitives.
 *
 * Node vocabulary
 * ---------------
 *   document     { type, lang, title, author, includeCoverPage, children }
 *   section      { type, id, pageBreakBefore, children }
 *   group        { type, role, children, ... }        logical block (project,
 *                careerEntry, testimonial, ...) a format may keep unbreakable
 *   heading      { type, level: 2|3, role, text, pageBreakBefore?, keepWithNext? }
 *   paragraph    { type, role, text? | runs? | lines?, keepWithNext?, ... }
 *   bulletList   { type, role, variant?, items: [{text}|{runs}], keepWithNext? }
 *   keyValueList { type, role, entries: [{label, value}], keepWithNext? }
 *   badgeRow     { type, role, items: [string], keepWithNext? }   joiner is
 *                format-side decoration
 *   table        { type, role, header?, rows? | cells? }
 *   statsRow     { type, items: [{value, label}] }
 *   spacer       { type, role }                       decorative rule/gap
 *
 * Runs: [{ text, role? }] where run.role marks the semantic part
 * ('label', 'value', 'strong', 'title', 'badge', 'period', ...).
 *
 * Known intentional per-format divergences (kept in the walkers, not here):
 *   - coverDate / testimonialFeaturedTag / pmCapabilitiesEnd nodes are
 *     rendered by the PDF walker only (legacy DOCX never rendered them).
 *   - The DOCX walker renders careerCompanyDescription before careerRole
 *     (legacy DOCX order); the IR canonical order is role first (web order).
 *
 * Classic script - exposes window.ExportIR. Depends on window.ExportContent.
 */

(function () {
  'use strict';

  // ── Shared helpers (content-level, format-agnostic) ─────────────────────

  function getTextIn(obj, lang) {
    return window.ExportContent.getTextIn(obj, lang);
  }

  function getArrayIn(obj, lang) {
    return window.ExportContent.getArrayIn(obj, lang);
  }

  /** Strip HTML tags from text (same rule both exporters used) */
  function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Format a period string with its computed duration appended.
   * Removes any pre-existing duration suffix before recomputing.
   */
  function formatPeriodWithDuration(period, lang) {
    let periodStr = getTextIn(period, lang);
    periodStr = periodStr.replace(/\s*\([^)]*(?:개월|년|months?|yrs?|mo)[^)]*\)/gi, '').trim();
    const duration = window.ExportContent.calculateDuration(period, lang);
    return duration ? `${periodStr} (${duration})` : periodStr;
  }

  /** Parse **bold** markers into runs ({role:'strong'} for emphasized parts) */
  function parseStrongRuns(text) {
    const parts = String(text).split(/\*\*(.+?)\*\*/g);
    return parts.map((part, index) =>
      index % 2 === 1 ? { text: part, role: 'strong' } : { text: part });
  }

  function localizedDate(lang) {
    const locale = lang === 'ko' ? 'ko-KR' : 'en-US';
    return new Date().toLocaleDateString(locale, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Cover page ──────────────────────────────────────────────────────────

  /**
   * Cover-page stats (max 4 entries). Was duplicated verbatim in both
   * exporters (buildStatsTable / buildStatsInfographic).
   */
  function computeStats(data, lang) {
    const kn = (data && data.manager && data.manager.businessImpact
      && data.manager.businessImpact.keyNumbers) || {};
    const certCount = (data && data.expertise && data.expertise.certifications
      && data.expertise.certifications.length) || kn.certifications;
    const stats = [];

    stats.push({ value: '20+', label: lang === 'ko' ? '경력 (년)' : 'Years' });
    if (certCount) stats.push({ value: String(certCount), label: lang === 'ko' ? '글로벌 인증' : 'Certifications' });
    if (kn.ipos) stats.push({ value: String(kn.ipos), label: 'IPO' });
    if (kn.performanceImprovement) stats.push({ value: String(kn.performanceImprovement), label: lang === 'ko' ? '성능 향상' : 'Performance' });
    if (kn.projectsDelivered && stats.length < 4) {
      stats.push({ value: String(kn.projectsDelivered), label: lang === 'ko' ? '프로젝트' : 'Projects' });
    }
    return stats.slice(0, 4);
  }

  function buildCoverSection(data, info, lang) {
    const children = [];
    const fieldIds = Array.isArray(info.personalInfoFields) ? info.personalInfoFields : [];
    const showPersonalInfo = fieldIds.length > 0;
    const subtitle = window.ExportContent.getCoverSubtitle(lang, data.profile);
    const summaryLines = window.ExportContent.getCoverSummaryLines(lang, data.profile);

    children.push({ type: 'spacer', role: 'coverTopRule' });
    children.push({ type: 'paragraph', role: 'coverName', text: info.author || info.title });
    // tight: personal-info row follows, so the subtitle keeps less bottom gap
    children.push({ type: 'paragraph', role: 'coverSubtitle', text: subtitle, tight: showPersonalInfo });

    if (showPersonalInfo && data.profile && Array.isArray(data.profile.fields)) {
      const byId = new Map(data.profile.fields.map(f => [f.id, f]));
      const parts = fieldIds
        .map(id => byId.get(id))
        .filter(Boolean)
        .map(f => getTextIn(f.value, lang))
        .filter(v => v && v.length > 0);
      if (parts.length) {
        children.push({ type: 'paragraph', role: 'coverPersonalInfo', text: parts.join('   ·   ') });
      }
    }

    children.push({ type: 'paragraph', role: 'coverSummary', lines: summaryLines });
    children.push({ type: 'spacer', role: 'coverDivider' });

    const stats = computeStats(data, lang);
    if (stats.length > 0) children.push({ type: 'statsRow', items: stats });

    if (data && data.expertise && data.expertise.certifications
      && data.expertise.certifications.length > 0) {
      children.push({
        type: 'paragraph', role: 'coverCertsLabel',
        text: lang === 'ko' ? '인증 / Certifications' : 'Certifications'
      });
      children.push({
        type: 'paragraph', role: 'coverCertsText',
        text: data.expertise.certifications.map(c => getTextIn(c.name, lang)).join('  ·  ')
      });
    }

    // Rendered by the PDF walker only (legacy DOCX cover carries no date).
    children.push({ type: 'paragraph', role: 'coverDate', text: localizedDate(lang) });

    return { type: 'section', id: 'cover', pageBreakBefore: false, children };
  }

  // ── Cover letter ────────────────────────────────────────────────────────

  function buildCoverLetterSection(template, includeCoverPage, lang) {
    const children = [];

    children.push({ type: 'paragraph', role: 'clGreeting', text: getTextIn(template.greeting, lang) });

    const position = getTextIn(template.targetRole, lang);
    children.push({
      type: 'paragraph', role: 'clOpening',
      text: getTextIn(template.opening, lang).replace('{position}', position)
    });

    const keyPoints = getArrayIn(template.keyPoints, lang);
    children.push({
      type: 'bulletList', role: 'clKeyPoints',
      items: keyPoints.map(p => ({ runs: parseStrongRuns(getTextIn(p, lang)) }))
    });

    children.push({ type: 'paragraph', role: 'clClosing', text: getTextIn(template.closing, lang) });
    children.push({ type: 'paragraph', role: 'clSignature', text: getTextIn(template.signature, lang) });

    return { type: 'section', id: 'coverLetter', pageBreakBefore: includeCoverPage, children };
  }

  // ── Inline header (no cover page) ───────────────────────────────────────

  function buildInlineHeaderSection(info, lang) {
    return {
      type: 'section', id: 'inlineHeader', pageBreakBefore: false,
      children: [
        {
          type: 'paragraph', role: 'inlineHeader',
          runs: [
            { text: info.author || info.title, role: 'title' },
            { text: localizedDate(lang), role: 'date' }
          ]
        },
        { type: 'spacer', role: 'inlineHeaderRule' }
      ]
    };
  }

  // ── Expertise ───────────────────────────────────────────────────────────

  function buildExpertiseSection(expertise, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.expertise }];

    if (expertise.categories && expertise.categories.length > 0) {
      expertise.categories.forEach(category => {
        const items = getArrayIn(category.items, lang);
        const tags = getArrayIn(category.tags, lang);
        const g = { type: 'group', role: 'expertiseCategory', children: [] };

        g.children.push({
          type: 'heading', level: 3, role: 'expertiseCategory',
          text: getTextIn(category.title, lang) || 'Category',
          keepWithNext: items.length > 0 || tags.length > 0
        });
        if (items.length > 0) {
          g.children.push({
            type: 'bulletList', role: 'expertiseItems',
            items: items.map(item => ({ text: stripHtml(getTextIn(item, lang)) })),
            keepWithNext: tags.length > 0
          });
        }
        if (tags.length > 0) {
          g.children.push({
            type: 'badgeRow', role: 'expertiseTags',
            items: tags.map(tag => getTextIn(tag, lang))
          });
        }
        children.push(g);
      });
    }

    if (expertise.heroCapabilities && expertise.heroCapabilities.length > 0) {
      children.push({
        type: 'group', role: 'heroCapabilities',
        children: [
          { type: 'heading', level: 3, role: 'coreCapabilities', text: labels.coreCapabilities, keepWithNext: true },
          {
            type: 'keyValueList', role: 'heroCapabilities',
            entries: expertise.heroCapabilities.map(cap => ({
              label: getTextIn(cap.title, lang),
              value: getTextIn(cap.description, lang)
            }))
          }
        ]
      });
    }

    if (expertise.certifications && expertise.certifications.length > 0) {
      children.push({
        type: 'group', role: 'certifications',
        children: [
          { type: 'heading', level: 3, role: 'certifications', text: labels.certifications, keepWithNext: true },
          {
            type: 'badgeRow', role: 'certificationBadges',
            items: expertise.certifications.map(cert => getTextIn(cert.name, lang))
          }
        ]
      });
    }

    return { type: 'section', id: 'expertise', children };
  }

  // ── Projects ────────────────────────────────────────────────────────────

  const PROJECT_CATEGORY_ORDER = ['medicalImaging', 'orthodontic', 'equipmentControl', 'enterprise', 'openSource'];

  function projectCategoryLabel(category, labels) {
    const names = {
      medicalImaging: labels.medicalImaging,
      orthodontic: labels.orthodontic,
      equipmentControl: labels.equipmentControl,
      enterprise: labels.enterprise,
      openSource: labels.openSource
    };
    return names[category] || category;
  }

  function buildProjectGroup(project, labels, lang) {
    const children = [];

    children.push({
      type: 'paragraph', role: 'projectTitle',
      text: getTextIn(project.title, lang) || getTextIn(project.name, lang) || 'Untitled Project'
    });

    if (project.company || project.period) {
      const runs = [];
      if (project.company) runs.push({ text: getTextIn(project.company, lang), role: 'company' });
      if (project.period) runs.push({ text: formatPeriodWithDuration(project.period, lang), role: 'period' });
      children.push({ type: 'paragraph', role: 'projectMeta', runs });
    }

    if (project.description) {
      children.push({
        type: 'paragraph', role: 'projectDescription',
        text: stripHtml(getTextIn(project.description, lang))
      });
    }

    const tags = getArrayIn(project.tags, lang);
    if (tags.length > 0) {
      children.push({
        type: 'badgeRow', role: 'projectTags',
        items: tags.map(tag => getTextIn(tag, lang)),
        keepWithNext: !!project.expanded
      });
    }

    if (project.expanded) {
      const roles = getArrayIn(project.expanded.roles, lang);
      const challenges = getArrayIn(project.expanded.challenges, lang);
      const solutions = getArrayIn(project.expanded.solutions, lang);
      const achievements = getArrayIn(project.expanded.achievements, lang);

      const pushBlock = (variant, labelText, list, keepWithNext) => {
        children.push({ type: 'paragraph', role: 'blockLabel', variant, text: '[ ' + labelText + ' ]' });
        children.push({
          type: 'bulletList', role: 'projectDetail', variant,
          items: list.map(x => ({ text: stripHtml(getTextIn(x, lang)) })),
          keepWithNext
        });
      };

      if (roles.length > 0) {
        children.push({ type: 'spacer', role: 'projectDetailRule' });
        pushBlock('roles', labels.keyResponsibilities, roles, achievements.length > 0);
      }
      if (challenges.length > 0) pushBlock('challenges', labels.challenges, challenges, false);
      if (solutions.length > 0) pushBlock('solutions', labels.solutions, solutions, false);
      if (achievements.length > 0) pushBlock('achievements', labels.achievements, achievements, false);
    }

    return { type: 'group', role: 'project', children };
  }

  function buildProjectsSection(projects, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.projects }];

    // Each category after the first starts on a new page; the first category
    // stays on the same page as the PROJECTS section header.
    let firstCategory = true;
    const pushCategory = (headingText, list) => {
      children.push({
        type: 'heading', level: 3, role: 'subsection',
        text: headingText, pageBreakBefore: !firstCategory
      });
      firstCategory = false;
      list.forEach(project => children.push(buildProjectGroup(project, labels, lang)));
    };

    if (projects.featured && projects.featured.length > 0) {
      pushCategory(labels.featuredProjects, projects.featured);
    }
    PROJECT_CATEGORY_ORDER.forEach(category => {
      if (projects[category] && projects[category].length > 0) {
        pushCategory(projectCategoryLabel(category, labels), projects[category]);
      }
    });

    return { type: 'section', id: 'projects', children };
  }

  // ── Career ──────────────────────────────────────────────────────────────

  function buildCareerEntry(item, labels, lang) {
    const children = [];

    const achievements = getArrayIn(item.achievements, lang);
    const tags = getArrayIn(item.tags, lang);
    const hasRole = !!(item.role || item.position);
    const hasCompanyDescription = !!item.companyDescription;
    const hasResponsibilities = !!item.responsibilities;
    const hasScale = !!(item.scale && (item.scale.company || item.scale.team));
    const hasDescription = !!item.description;
    const hasAchievements = achievements.length > 0;
    const hasNote = !!item.note;
    const hasLeaveReason = !!item.leaveReason;
    const hasTags = tags.length > 0;

    // Header: company (+ optional badge) + period
    const headerRuns = [{ text: getTextIn(item.company, lang) || getTextIn(item.title, lang) || '', role: 'title' }];
    if (item.badge) headerRuns.push({ text: getTextIn(item.badge, lang), role: 'badge' });
    headerRuns.push({ text: formatPeriodWithDuration(item.period, lang) || '', role: 'period' });
    children.push({ type: 'paragraph', role: 'careerHeader', runs: headerRuns, keepWithNext: true });

    // Canonical order: role first, company context second (web order).
    // The DOCX walker renders companyDescription before role (legacy order).
    if (hasRole) {
      children.push({
        type: 'paragraph', role: 'careerRole',
        text: getTextIn(item.role, lang) || getTextIn(item.position, lang),
        keepWithNext: hasResponsibilities || hasScale || hasDescription
          || hasAchievements || hasNote || hasTags || hasLeaveReason
      });
    }
    if (hasCompanyDescription) {
      children.push({
        type: 'paragraph', role: 'careerCompanyDescription',
        text: stripHtml(getTextIn(item.companyDescription, lang)),
        keepWithNext: true
      });
    }
    if (hasResponsibilities) {
      children.push({
        type: 'paragraph', role: 'careerResponsibilities',
        runs: [
          { text: labels.responsibilities, role: 'label' },
          { text: stripHtml(getTextIn(item.responsibilities, lang)), role: 'value' }
        ],
        keepWithNext: hasScale || hasDescription || hasAchievements
          || hasNote || hasTags || hasLeaveReason
      });
    }
    if (hasScale) {
      const entries = [];
      if (item.scale.company) entries.push({ label: labels.companyScale, value: getTextIn(item.scale.company, lang) });
      if (item.scale.team) entries.push({ label: labels.teamScale, value: getTextIn(item.scale.team, lang) });
      children.push({
        type: 'keyValueList', role: 'careerScale', entries,
        keepWithNext: hasDescription || hasAchievements || hasNote || hasTags || hasLeaveReason
      });
    }
    if (hasDescription) {
      children.push({
        type: 'paragraph', role: 'careerDescription',
        text: stripHtml(getTextIn(item.description, lang)),
        keepWithNext: hasAchievements || hasNote || hasTags || hasLeaveReason
      });
    }
    if (hasAchievements) {
      children.push({ type: 'paragraph', role: 'blockLabel', variant: 'keyAchievements', text: '[ ' + labels.keyAchievements + ' ]' });
      children.push({
        type: 'bulletList', role: 'careerAchievements',
        items: achievements.map(a => ({ text: stripHtml(getTextIn(a, lang)) })),
        keepWithNext: hasNote || hasTags || hasLeaveReason
      });
    }
    if (hasNote) {
      children.push({
        type: 'paragraph', role: 'careerNote',
        text: stripHtml(getTextIn(item.note, lang)),
        keepWithNext: hasTags || hasLeaveReason
      });
    }
    if (hasLeaveReason) {
      children.push({
        type: 'paragraph', role: 'careerLeaveReason',
        runs: [
          { text: labels.reasonForLeaving, role: 'label' },
          { text: stripHtml(getTextIn(item.leaveReason, lang)), role: 'value' }
        ],
        keepWithNext: hasTags
      });
    }
    if (hasTags) {
      children.push({
        type: 'badgeRow', role: 'careerTags',
        items: tags.map(tag => getTextIn(tag, lang))
      });
    }

    return { type: 'group', role: 'careerEntry', children };
  }

  function buildCareerSection(career, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.career }];
    if (career.timeline && career.timeline.length > 0) {
      career.timeline.forEach(item => children.push(buildCareerEntry(item, labels, lang)));
    }
    return { type: 'section', id: 'career', children };
  }

  // ── Education ───────────────────────────────────────────────────────────

  function buildEducationSection(education, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.education }];
    const items = (education && education.items) || [];

    items.forEach(item => {
      const g = { type: 'group', role: 'educationEntry', children: [] };
      g.children.push({
        type: 'paragraph', role: 'eduHeader',
        runs: [
          { text: getTextIn(item.institution, lang) || '', role: 'title' },
          { text: item.period || '', role: 'meta' }
        ]
      });
      if (item.degree) {
        g.children.push({ type: 'paragraph', role: 'eduDegree', text: getTextIn(item.degree, lang) });
      }
      if (item.location) {
        g.children.push({ type: 'paragraph', role: 'eduLocation', text: getTextIn(item.location, lang) });
      }
      children.push(g);
    });

    return { type: 'section', id: 'education', children };
  }

  // ── Compensation (private) ──────────────────────────────────────────────

  function buildCompensationSection(compensation, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.compensation }];

    if (compensation.subtitle) {
      children.push({ type: 'paragraph', role: 'compSubtitle', text: getTextIn(compensation.subtitle, lang) });
    }
    if (compensation.intro) {
      children.push({ type: 'paragraph', role: 'compIntro', text: getTextIn(compensation.intro, lang) });
    }

    children.push({
      type: 'paragraph', role: 'compWarning',
      text: getTextIn({
        ko: '※ 본 섹션은 비공개 협상용 자료입니다. 외부 유출 금지.',
        en: '※ This section is private negotiation material. Do not distribute externally.'
      }, lang)
    });

    if (compensation.currentPackage) {
      children.push({
        type: 'paragraph', role: 'compBlockTitle', variant: 'package',
        text: getTextIn(compensation.currentPackage.label, lang) || ''
      });
      children.push({
        type: 'keyValueList', role: 'compComponents',
        entries: (compensation.currentPackage.components || []).map(c => ({
          label: getTextIn(c.label, lang),
          value: c.value || ''
        }))
      });
      if (compensation.currentPackage.estimatedAnnualEv) {
        children.push({
          type: 'paragraph', role: 'compEstimate',
          text: getTextIn(compensation.currentPackage.estimatedAnnualEv, lang)
        });
      }
    }

    const tiers = compensation.tiers || [];
    if (tiers.length > 0) {
      children.push({
        type: 'table', role: 'compTiers',
        header: [
          { ko: '시나리오', en: 'Tier' },
          { ko: '기본급', en: 'Base' },
          { ko: '사이닝', en: 'Signing' },
          { ko: '인센티브', en: 'Incentive' },
          { ko: '옵션/RSU', en: 'Options/RSU' },
          { ko: '1년차 총보상', en: '1Y Total' }
        ].map(h => getTextIn(h, lang)),
        rows: tiers.map(tier => [
          tier.label, tier.base, tier.signing, tier.incentive, tier.options, tier.totalFirstYear
        ].map(v => getTextIn(v, lang) || ''))
      });

      const rationales = tiers
        .filter(tier => tier.rationale)
        .map(tier => ({ label: getTextIn(tier.label, lang), value: getTextIn(tier.rationale, lang) }));
      if (rationales.length > 0) {
        children.push({ type: 'keyValueList', role: 'compRationales', entries: rationales });
      }
    }

    if (Array.isArray(compensation.nonNegotiables) && compensation.nonNegotiables.length) {
      children.push({
        type: 'paragraph', role: 'compBlockTitle', variant: 'terms',
        text: getTextIn({ ko: '비협상 조건', en: 'Non-negotiable Terms' }, lang)
      });
      children.push({
        type: 'bulletList', role: 'compNonNegotiables',
        items: compensation.nonNegotiables.map(item => ({ text: getTextIn(item, lang) }))
      });
    }

    if (compensation.negotiationStance) {
      children.push({
        type: 'paragraph', role: 'compBlockTitle', variant: 'stance',
        text: getTextIn({ ko: '협상 입장', en: 'Negotiation Stance' }, lang)
      });
      children.push({
        type: 'paragraph', role: 'compStance',
        text: getTextIn(compensation.negotiationStance, lang)
      });
    }

    if (compensation.lastUpdated) {
      children.push({
        type: 'paragraph', role: 'compLastUpdated',
        text: getTextIn({
          ko: `최종 갱신: ${compensation.lastUpdated}`,
          en: `Last updated: ${compensation.lastUpdated}`
        }, lang)
      });
    }

    return { type: 'section', id: 'compensation', children };
  }

  // ── Testimonials ────────────────────────────────────────────────────────

  function buildTestimonialGroup(t, featured, lang) {
    const children = [];
    const hasLabels = !!(t.labels && t.labels.length > 0);

    // Rendered by the PDF walker only (legacy DOCX had no featured marker).
    if (featured) {
      children.push({ type: 'paragraph', role: 'testimonialFeaturedTag', text: '[ Featured Testimonial ]' });
    }

    if (t.quote || t.text) {
      children.push({
        type: 'paragraph', role: 'testimonialQuote',
        text: stripHtml(getTextIn(t.quote, lang) || getTextIn(t.text, lang))
      });
    }

    const authorRuns = [];
    if (t.author || t.name) {
      authorRuns.push({ text: getTextIn(t.author, lang) || getTextIn(t.name, lang), role: 'author' });
    }
    if (t.role) authorRuns.push({ text: getTextIn(t.role, lang), role: 'authorRole' });
    if (t.relation) authorRuns.push({ text: getTextIn(t.relation, lang), role: 'relation' });
    children.push({ type: 'paragraph', role: 'testimonialAuthor', runs: authorRuns, keepWithNext: hasLabels });

    if (hasLabels) {
      children.push({
        type: 'badgeRow', role: 'testimonialLabels',
        items: t.labels.map(l => getTextIn(l.text, lang))
      });
    }

    return { type: 'group', role: 'testimonial', featured, children };
  }

  function buildTestimonialsSection(testimonials, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.testimonials }];

    const ordered = [];
    if (testimonials.featured) ordered.push({ t: testimonials.featured, featured: true });
    if (testimonials.testimonials && testimonials.testimonials.length > 0) {
      testimonials.testimonials.forEach(t => ordered.push({ t, featured: false }));
    }

    ordered.forEach(({ t, featured }, idx) => {
      if (idx > 0) children.push({ type: 'spacer', role: 'testimonialDivider' });
      children.push(buildTestimonialGroup(t, featured, lang));
    });

    return { type: 'section', id: 'testimonials', children };
  }

  // ── Manager / leadership ────────────────────────────────────────────────

  function computeCapabilityChips(metrics, lang) {
    const m = metrics || {};
    const chips = [];
    if (Array.isArray(m.teamSizes) && m.teamSizes.length > 0) {
      const min = Math.min(...m.teamSizes), max = Math.max(...m.teamSizes);
      chips.push(`${lang === 'ko' ? '팀 규모' : 'Team Size'} ${min}–${max}`);
    }
    if (m.yearsLeading) chips.push(`${lang === 'ko' ? '리딩 연차' : 'Leading'} ${m.yearsLeading}+ ${lang === 'ko' ? '년' : 'yrs'}`);
    if (m.projectsLed) chips.push(`${lang === 'ko' ? '리딩 프로젝트' : 'Projects Led'} ${m.projectsLed}+`);
    if (m.onTimeDelivery) chips.push(`${lang === 'ko' ? '정시 납품' : 'On-Time'} ${m.onTimeDelivery}`);
    if (m.certificationSuccess) chips.push(`${lang === 'ko' ? '인증 성공률' : 'Cert Success'} ${m.certificationSuccess}`);
    if (m.majorProjects) chips.push(`${lang === 'ko' ? '주요 프로젝트' : 'Major Projects'} ${m.majorProjects}+`);
    return chips;
  }

  function buildManagerSection(manager, labels, lang) {
    const children = [{ type: 'heading', level: 2, role: 'section', text: labels.manager }];

    if (manager.pmCapabilities && manager.pmCapabilities.length > 0) {
      children.push({ type: 'heading', level: 3, role: 'subsection', text: labels.pmCapabilities, pageBreakBefore: false });

      manager.pmCapabilities.forEach((cap, idx) => {
        const g = { type: 'group', role: 'pmCapability', children: [] };

        g.children.push({
          type: 'paragraph', role: 'pmCapTitle',
          text: getTextIn(cap.title, lang), first: idx === 0
        });
        if (cap.description) {
          g.children.push({ type: 'paragraph', role: 'pmCapDescription', text: getTextIn(cap.description, lang) });
        }

        const highlights = getArrayIn(cap.highlights, lang);
        if (highlights.length > 0) {
          g.children.push({
            type: 'bulletList', role: 'pmCapHighlights',
            items: highlights.map(h => ({ text: stripHtml(getTextIn(h, lang)) }))
          });
        }

        const chips = computeCapabilityChips(cap.metrics, lang);
        if (chips.length > 0) {
          g.children.push({ type: 'badgeRow', role: 'pmCapMetrics', items: chips });
        }

        const tags = getArrayIn(cap.stakeholderTypes, lang).concat(cap.frameworks || []);
        if (tags.length > 0) {
          g.children.push({ type: 'badgeRow', role: 'pmCapTags', items: tags.map(t => getTextIn(t, lang)) });
        }

        children.push(g);
      });

      // Rendered by the PDF walker only (legacy trailing gap node).
      children.push({ type: 'spacer', role: 'pmCapabilitiesEnd' });
    }

    if (manager.leadershipStyle) {
      const principles = getArrayIn(manager.leadershipStyle.principles, lang);
      if (principles.length > 0) {
        children.push({ type: 'heading', level: 3, role: 'subsection', text: labels.leadershipStyle, pageBreakBefore: false });
        children.push({
          type: 'bulletList', role: 'managerPrinciples',
          items: principles.map(p => ({ text: stripHtml(getTextIn(p, lang)) }))
        });
      }
    }

    if (manager.businessImpact) {
      // keyNumbers omitted - already shown on the cover-page stat infographic.
      const highlights = getArrayIn(manager.businessImpact.highlights, lang);
      if (highlights.length > 0) {
        children.push({ type: 'heading', level: 3, role: 'subsection', text: labels.businessImpact, pageBreakBefore: false });
        children.push({
          type: 'bulletList', role: 'managerImpact',
          items: highlights.map(h => ({ text: stripHtml(getTextIn(h, lang)) }))
        });
      }
    }

    if (manager.softSkills && manager.softSkills.length > 0) {
      children.push({ type: 'heading', level: 3, role: 'subsection', text: labels.softSkills, pageBreakBefore: false });
      children.push({
        type: 'table', role: 'softSkillsGrid',
        cells: manager.softSkills.map(skill => ({
          title: getTextIn(skill.title, lang),
          description: skill.description ? getTextIn(skill.description, lang) : null
        }))
      });
    }

    return { type: 'section', id: 'manager', children };
  }

  // ── Document assembly ───────────────────────────────────────────────────

  /**
   * Build the format-neutral export tree.
   * @param {Object} data - Portfolio data (same shape the exporters receive)
   * @param {Object} options - Export info/options
   * @param {Array}  options.sections - Content section ids in render order
   * @param {string} options.title - Document title
   * @param {string} options.author - Document author
   * @param {boolean} options.includeCoverPage
   * @param {boolean} options.includeCoverLetter
   * @param {Object}  options.coverLetterTemplate
   * @param {boolean} options.pageBreakBetweenSections
   * @param {Array}   options.personalInfoFields - Selected profile field ids
   * @param {string} lang - Language code ('ko' or 'en')
   * @returns {Object} document node
   */
  function build(data, options = {}, lang = 'ko') {
    const {
      sections = ['expertise', 'manager', 'projects', 'career', 'education', 'testimonials'],
      title = lang === 'ko' ? '포트폴리오' : 'Portfolio',
      author = lang === 'ko' ? '신동철' : 'Dongcheol Shin',
      includeCoverPage = true,
      includeCoverLetter = false,
      coverLetterTemplate = null,
      pageBreakBetweenSections = true,
      personalInfoFields = []
    } = options;

    const labels = window.ExportContent.getLabels(lang);
    const children = [];

    if (includeCoverPage) {
      children.push(buildCoverSection(data, { title, author, personalInfoFields }, lang));
    }
    if (includeCoverLetter && coverLetterTemplate) {
      children.push(buildCoverLetterSection(coverLetterTemplate, includeCoverPage, lang));
    }
    if (!includeCoverPage) {
      children.push(buildInlineHeaderSection({ title, author }, lang));
    }

    // With a cover page or cover letter ahead, every content section starts
    // on a new page; otherwise only break between sections (skip the first).
    // The section-array index is used (not the rendered index) so a leading
    // section without data does not change the breaks of the following ones.
    const headPlaced = includeCoverPage || includeCoverLetter;
    sections.forEach((sectionId, index) => {
      const pageBreakBefore = headPlaced ? true : (pageBreakBetweenSections && index > 0);
      let node = null;
      switch (sectionId) {
        case 'expertise':
          if (data.expertise) node = buildExpertiseSection(data.expertise, labels, lang);
          break;
        case 'projects':
          if (data.projects) node = buildProjectsSection(data.projects, labels, lang);
          break;
        case 'career':
          if (data.career) node = buildCareerSection(data.career, labels, lang);
          break;
        case 'testimonials':
          if (data.testimonials) node = buildTestimonialsSection(data.testimonials, labels, lang);
          break;
        case 'manager':
          if (data.manager) node = buildManagerSection(data.manager, labels, lang);
          break;
        case 'education':
          if (data.education) node = buildEducationSection(data.education, labels, lang);
          break;
        case 'compensation':
          if (data.compensation) node = buildCompensationSection(data.compensation, labels, lang);
          break;
      }
      if (node) {
        node.pageBreakBefore = pageBreakBefore;
        // Stamp the section heading too, so walkers can emit it directly.
        const first = node.children[0];
        if (first && first.type === 'heading' && first.level === 2) {
          first.pageBreakBefore = pageBreakBefore;
        }
        children.push(node);
      }
    });

    return { type: 'document', lang, title, author, includeCoverPage, children };
  }

  // Export for browser global access
  window.ExportIR = { build };
})();
