/** Erreur applicative personnalisee pour transporter un message et un code HTTP.
 * AppError herite de `Error` (`extends Error`) et permet d'etendre les proprietes
 * de la classe native (message, stack, name) avec `status`.
 */
export class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message); // initialise la partie native `Error` avec le message.
    this.name = "AppError"; // remplace le nom par defaut pour faciliter le debug.
    this.status = status; // assigne le code HTTP (par defaut 500)

    // Garantit que `instanceof AppError` fonctionne correctement.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
