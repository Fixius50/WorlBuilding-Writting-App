import os, re
for root, dirs, files in os.walk('src/features/Entities'):
    for file in files:
        if not file.endswith('.tsx') and not file.endswith('.ts'): continue
        path = os.path.join(root, file)
        content = open(path, 'r', encoding='utf-8').read()
        
        orig = content

        content = content.replace("import { entityService } from '@repositories/entityService';", "import { EntityUseCase } from '@application/useCases/EntityUseCase';\nimport { TemplateUseCase } from '@application/useCases/TemplateUseCase';")
        content = content.replace("import { folderService } from '@repositories/folderService';", "import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';")
        content = content.replace("import { templateService } from '@repositories/templateService';", "import { TemplateUseCase } from '@application/useCases/TemplateUseCase';")
        content = content.replace("import { relationshipService, Relacion } from '@repositories/relationshipService';", "import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';\nimport { Relacion } from '@domain/models/database';")
        content = content.replace("import { relationshipService, RelacionEnriquecida } from '@repositories/relationshipService';", "import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';\nimport { RelacionEnriquecida } from '@repositories/relationshipService';")
        content = content.replace("import { settingsService } from '@repositories/settingsService';", "import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';")
        content = content.replace("import { timelineService } from '@repositories/timelineService';", "import { TimelineUseCase } from '@application/useCases/TimelineUseCase';")
        content = content.replace("import { relationshipService } from '@repositories/relationshipService';", "import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';")

        content = content.replace('entityService.getValues(', 'TemplateUseCase.getEntityValues(')
        content = content.replace('entityService.addValue(', 'TemplateUseCase.addEntityValue(')
        content = content.replace('entityService.updateValue(', 'TemplateUseCase.updateEntityValue(')
        content = content.replace('entityService.deleteValue(', 'TemplateUseCase.deleteEntityValue(')
        content = content.replace('entityService.', 'EntityUseCase.')

        content = content.replace('folderService.getById(', 'WorkspaceUseCase.getFolderById(')
        content = content.replace('folderService.getSubfolders(', 'WorkspaceUseCase.getSubfolders(')
        content = content.replace('folderService.getPath(', 'WorkspaceUseCase.getFolderPath(')
        content = content.replace('folderService.getByProject(', 'WorkspaceUseCase.getRootFolders(')
        content = content.replace('folderService.create(', 'WorkspaceUseCase.createFolder(')
        content = content.replace('folderService.delete(', 'WorkspaceUseCase.deleteFolder(')
        content = content.replace('folderService.', 'WorkspaceUseCase.')

        content = content.replace('templateService.getAll(', 'TemplateUseCase.getTemplates(')
        content = content.replace('templateService.create(', 'TemplateUseCase.createTemplate(')
        content = content.replace('templateService.update(', 'TemplateUseCase.updateTemplate(')
        content = content.replace('templateService.delete(', 'TemplateUseCase.deleteTemplate(')
        content = content.replace('templateService.', 'TemplateUseCase.')

        content = content.replace('relationshipService.getByEntity(', 'RelationshipUseCase.getRelationshipsByEntity(')
        content = content.replace('relationshipService.create(', 'RelationshipUseCase.createRelationship(')
        content = content.replace('relationshipService.update(', 'RelationshipUseCase.updateRelationship(')
        content = content.replace('relationshipService.delete(', 'RelationshipUseCase.deleteRelationship(')
        content = content.replace('relationshipService.', 'RelationshipUseCase.')

        content = content.replace('settingsService.get(', 'WorkspaceUseCase.getSetting(')
        content = content.replace('settingsService.set(', 'WorkspaceUseCase.saveSetting(')

        if content.count("import { TemplateUseCase } from '@application/useCases/TemplateUseCase';") > 1:
            content = content.replace("import { TemplateUseCase } from '@application/useCases/TemplateUseCase';\n", "", 1)
        if content.count("import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';") > 1:
            content = content.replace("import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';\n", "", 1)
        
        if content != orig:
            open(path, 'w', encoding='utf-8').write(content)
            print('Updated', path)
