declare module "validate-npm-package-name" {
  type ValidationResult = {
    errors?: string[];
    validForNewPackages: boolean;
    warnings?: string[];
  };

  export default function validatePackageName(name: string): ValidationResult;
}
