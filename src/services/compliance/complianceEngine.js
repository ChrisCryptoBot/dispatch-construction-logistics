const { prisma } = require('../../db/prisma');

/**
 * Compliance Engine Service
 * Validates loads against regulatory rules and requirements
 */

class ComplianceEngine {
  /**
   * Check load compliance against all applicable rules
   */
  async checkLoadCompliance(loadData) {
    const {
      loadType,
      commodity,
      equipmentType,
      origin,
      destination,
      distance,
      weight,
      dimensions,
      hazmatClass
    } = loadData;

    const violations = [];
    const warnings = [];
    const requiredActions = [];

    // Get applicable compliance rules
    const rules = await this.getApplicableRules(origin, destination, loadType, commodity);

    // Check each rule
    for (const rule of rules) {
      const result = await this.checkRule(rule, loadData);
      
      if (result.violations.length > 0) {
        violations.push(...result.violations);
      }
      
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings);
      }
      
      if (result.requiredActions.length > 0) {
        requiredActions.push(...result.requiredActions);
      }
    }

    // Determine overall compliance status
    const status = violations.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT';
    const canProceed = violations.length === 0;

    return {
      status,
      canProceed,
      violations,
      warnings,
      requiredActions,
      summary: this.generateComplianceSummary(violations, warnings, requiredActions)
    };
  }

  /**
   * Get applicable compliance rules based on scope
   */
  async getApplicableRules(origin, destination, loadType, commodity) {
    const rules = [];

    // Get national rules
    const nationalRules = await prisma.complianceRule.findMany({
      where: {
        scope: 'national',
        active: true
      }
    });
    rules.push(...nationalRules);

    // Get state-specific rules
    if (origin.state) {
      const stateRules = await prisma.complianceRule.findMany({
        where: {
          scope: `state:${origin.state}`,
          active: true
        }
      });
      rules.push(...stateRules);
    }

    if (destination.state && destination.state !== origin.state) {
      const destStateRules = await prisma.complianceRule.findMany({
        where: {
          scope: `state:${destination.state}`,
          active: true
        }
      });
      rules.push(...destStateRules);
    }

    // Get zone-specific rules
    const zones = await this.getApplicableZones(origin, destination);
    for (const zone of zones) {
      const zoneRules = await prisma.complianceRule.findMany({
        where: {
          scope: `zone:${zone.id}`,
          active: true
        }
      });
      rules.push(...zoneRules);
    }

    return rules;
  }

  /**
   * Check a specific compliance rule
   */
  async checkRule(rule, loadData) {
    const violations = [];
    const warnings = [];
    const requiredActions = [];

    switch (rule.ruleType) {
      case 'overweight':
        const weightResult = this.checkWeightLimits(rule, loadData);
        if (weightResult.violation) violations.push(weightResult.violation);
        if (weightResult.warning) warnings.push(weightResult.warning);
        if (weightResult.action) requiredActions.push(weightResult.action);
        break;

      case 'oversize':
        const sizeResult = this.checkSizeLimits(rule, loadData);
        if (sizeResult.violation) violations.push(sizeResult.violation);
        if (sizeResult.warning) warnings.push(sizeResult.warning);
        if (sizeResult.action) requiredActions.push(sizeResult.action);
        break;

      case 'hazmat':
        const hazmatResult = this.checkHazmatRequirements(rule, loadData);
        if (hazmatResult.violation) violations.push(hazmatResult.violation);
        if (hazmatResult.warning) warnings.push(hazmatResult.warning);
        if (hazmatResult.action) requiredActions.push(hazmatResult.action);
        break;

      case 'municipal_dump':
        const dumpResult = this.checkMunicipalDumpRules(rule, loadData);
        if (dumpResult.violation) violations.push(dumpResult.violation);
        if (dumpResult.warning) warnings.push(dumpResult.warning);
        if (dumpResult.action) requiredActions.push(dumpResult.action);
        break;

      case 'prevailing_wage':
        const wageResult = this.checkPrevailingWageRules(rule, loadData);
        if (wageResult.violation) violations.push(wageResult.violation);
        if (wageResult.warning) warnings.push(wageResult.warning);
        if (wageResult.action) requiredActions.push(wageResult.action);
        break;
    }

    return { violations, warnings, requiredActions };
  }

  /**
   * Check weight limits
   */
  checkWeightLimits(rule, loadData) {
    const { weight, equipmentType } = loadData;
    const { conditions, actions } = rule;

    if (!weight) {
      return { warning: 'Weight not specified - compliance cannot be verified' };
    }

    const maxGrossWeight = conditions.grossWeight?.max || 80000;
    const maxAxleWeight = conditions.axleWeight?.max || 20000;

    if (weight.gross > maxGrossWeight) {
      return {
        violation: `Gross weight ${weight.gross}lbs exceeds limit of ${maxGrossWeight}lbs`,
        action: actions.requirePermit ? 'Obtain overweight permit' : 'Reduce weight'
      };
    }

    if (weight.axle && weight.axle > maxAxleWeight) {
      return {
        violation: `Axle weight ${weight.axle}lbs exceeds limit of ${maxAxleWeight}lbs`,
        action: actions.requirePermit ? 'Obtain overweight permit' : 'Redistribute weight'
      };
    }

    return {};
  }

  /**
   * Check size limits
   */
  checkSizeLimits(rule, loadData) {
    const { dimensions, equipmentType } = loadData;
    const { conditions, actions } = rule;

    if (!dimensions) {
      return { warning: 'Dimensions not specified - compliance cannot be verified' };
    }

    const maxWidth = conditions.width?.max || 102;
    const maxHeight = conditions.height?.max || 168;
    const maxLength = conditions.length?.max || 59;

    const violations = [];
    const requiredActions = [];

    if (dimensions.width > maxWidth) {
      violations.push(`Width ${dimensions.width}" exceeds limit of ${maxWidth}"`);
      if (actions.requirePermit) requiredActions.push('Obtain oversize permit');
    }

    if (dimensions.height > maxHeight) {
      violations.push(`Height ${dimensions.height}" exceeds limit of ${maxHeight}"`);
      if (actions.requirePermit) requiredActions.push('Obtain oversize permit');
    }

    if (dimensions.length > maxLength) {
      violations.push(`Length ${dimensions.length}" exceeds limit of ${maxLength}"`);
      if (actions.requirePermit) requiredActions.push('Obtain oversize permit');
    }

    if (actions.requireEscort && (dimensions.width > 96 || dimensions.height > 144)) {
      requiredActions.push('Arrange escort vehicle');
    }

    if (violations.length > 0) {
      return {
        violation: violations.join('; '),
        action: requiredActions.join('; ')
      };
    }

    return {};
  }

  /**
   * Check hazmat requirements
   */
  checkHazmatRequirements(rule, loadData) {
    const { hazmatClass, commodity, equipmentType } = loadData;
    const { conditions, actions } = rule;

    if (!hazmatClass) {
      return {};
    }

    const requiredClasses = conditions.hazmatClass?.any || [];
    const isHazmat = requiredClasses.includes(hazmatClass);

    if (isHazmat) {
      const requiredActions = [];
      
      if (actions.requirePlacard) {
        requiredActions.push('Display proper hazmat placards');
      }
      
      if (actions.requireManifest) {
        requiredActions.push('Prepare hazmat manifest');
      }

      return {
        action: requiredActions.join('; ')
      };
    }

    return {};
  }

  /**
   * Check municipal dump rules
   */
  checkMunicipalDumpRules(rule, loadData) {
    const { destination, commodity } = loadData;
    const { conditions, actions } = rule;

    // Check if destination is a municipal dump
    const isMunicipalDump = destination.siteName?.toLowerCase().includes('municipal') ||
                           destination.siteName?.toLowerCase().includes('city dump') ||
                           destination.siteName?.toLowerCase().includes('transfer station');

    if (isMunicipalDump) {
      const allowedCommodities = conditions.allowedCommodities || [];
      const isAllowed = allowedCommodities.some(allowed => 
        commodity.toLowerCase().includes(allowed.toLowerCase())
      );

      if (!isAllowed) {
        return {
          violation: `Commodity "${commodity}" not allowed at municipal dump`,
          action: 'Find alternative disposal site or obtain special permit'
        };
      }
    }

    return {};
  }

  /**
   * Check prevailing wage rules
   */
  checkPrevailingWageRules(rule, loadData) {
    const { destination, loadType } = loadData;
    const { conditions, actions } = rule;

    // Check if this is a public project
    const isPublicProject = destination.siteName?.toLowerCase().includes('city') ||
                           destination.siteName?.toLowerCase().includes('county') ||
                           destination.siteName?.toLowerCase().includes('state') ||
                           destination.siteName?.toLowerCase().includes('federal');

    if (isPublicProject) {
      return {
        action: 'Verify prevailing wage requirements and obtain certified payroll'
      };
    }

    return {};
  }

  /**
   * Get applicable zones for origin and destination
   */
  async getApplicableZones(origin, destination) {
    // This would integrate with a geocoding service to determine zones
    // For now, return empty array
    return [];
  }

  /**
   * Generate compliance summary
   */
  generateComplianceSummary(violations, warnings, requiredActions) {
    const summary = {
      status: violations.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
      canProceed: violations.length === 0,
      violationCount: violations.length,
      warningCount: warnings.length,
      actionCount: requiredActions.length
    };

    if (violations.length > 0) {
      summary.message = `Load has ${violations.length} compliance violation(s) that must be resolved`;
    } else if (warnings.length > 0) {
      summary.message = `Load has ${warnings.length} compliance warning(s) but can proceed`;
    } else {
      summary.message = 'Load is fully compliant with all applicable regulations';
    }

    return summary;
  }

  /**
   * Get compliance rules for a specific scope
   */
  async getRulesByScope(scope) {
    return await prisma.complianceRule.findMany({
      where: {
        scope,
        active: true
      },
      orderBy: {
        priority: 'asc'
      }
    });
  }

  /**
   * Add new compliance rule
   */
  async addComplianceRule(ruleData) {
    return await prisma.complianceRule.create({
      data: ruleData
    });
  }
}

const complianceEngine = new ComplianceEngine();

module.exports = { complianceEngine };

