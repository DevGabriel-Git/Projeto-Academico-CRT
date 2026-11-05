package com.crt;
import com.tngtech.archunit.junit.*;
import com.tngtech.archunit.lang.ArchRule;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
@AnalyzeClasses(packages="com.crt", importOptions=com.tngtech.archunit.core.importer.ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {
    @ArchTest static final ArchRule controllersUseServices = noClasses().that().resideInAPackage("..controller..")
        .should().dependOnClassesThat().resideInAnyPackage("..repository..", "..adapter..");
    @ArchTest static final ArchRule entitiesDoNotDependOnWeb = noClasses().that().resideInAPackage("..entity..")
        .should().dependOnClassesThat().resideInAnyPackage("..controller..", "..service..", "..adapter..");
    @ArchTest static final ArchRule servicesDoNotDependOnControllers = noClasses().that().resideInAPackage("..service..")
        .should().dependOnClassesThat().resideInAPackage("..controller..");
    @ArchTest static final ArchRule repositoriesDoNotDependOnServices = noClasses().that().resideInAPackage("..repository..")
        .should().dependOnClassesThat().resideInAnyPackage("..controller..", "..service..");
}
