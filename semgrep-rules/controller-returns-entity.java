// Synthetic rule fixture, not application code.
@RestController
class ExampleController {
    // ruleid: corretora-controller-returns-entity
    public Carteira expose() { return domain.find(); }
    // ok: corretora-controller-returns-entity
    public CarteiraResponse view() { return application.find(); }
}
