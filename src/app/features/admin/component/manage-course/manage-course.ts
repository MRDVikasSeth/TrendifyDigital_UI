import { Component, OnInit } from '@angular/core';
import { CourseStructureService } from '../../Service/courseStructure.service';
import Swal from 'sweetalert2';
import { SectionDTO } from '../../../../core/DTOs/CourceMaster/ISection.dto';
import { ModuleDTO } from '../../../../core/DTOs/CourceMaster/IModule.dto';
import { TopicDTO } from '../../../../core/DTOs/CourceMaster/ITopic.dto';
import { ContentDTO } from '../../../../core/DTOs/CourceMaster/IContent.dto';


@Component({
  selector: 'app-manage-course',
  standalone: false,
  templateUrl: './manage-course.html',
  styleUrl: './manage-course.css'
})
export class ManageCourse implements OnInit {

  // ==============================
  // Strongly Typed Data Arrays
  // ==============================
  sections?: SectionDTO[] = [];
  modules?: ModuleDTO[] = [];
  topics?: TopicDTO[] = [];
  contents?: ContentDTO[] = [];

  // ==============================
  // Selected IDs
  // ==============================
  selectedSectionId: string = '';
  selectedModuleId: string = '';
  selectedTopicId: string = '';

  constructor(private adminService: CourseStructureService) { }

  ngOnInit(): void {
    this.loadSections();
  }

  // ==============================
  // SECTION CRUD
  // ==============================
  loadSections() {
    console.log('test');

    this.adminService.getAllSections().subscribe({
      next: (data: SectionDTO[]) => {
        console.log('Sections:', data);
        this.sections = data;
      },
      error: (err) => console.error('Error loading sections:', err)
    });
  }

  addSection(sectionName: string) {
    if (!sectionName.trim()) {
      Swal.fire('⚠️ Required', 'Section name is required', 'warning');
      return;
    }

    const section: SectionDTO = { sectionName };
    this.adminService.createSection(section).subscribe({
      next: () => {
        this.loadSections();
        Swal.fire('✅ Success', 'Section added successfully!', 'success');
      },
      error: (err) => {
        console.error('Add section error:', err);
        Swal.fire('❌ Error', 'Failed to add section', 'error');
      }
    });
  }

  updateSection(section: SectionDTO) {
    Swal.fire({
      title: 'Edit Section',
      input: 'text',
      inputValue: section.sectionName,
      inputPlaceholder: 'Enter section name',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: (value) => {
        if (!value.trim()) {
          Swal.showValidationMessage('Section name cannot be empty');
          return false;
        }
        return value.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && section._id) {
        const updatedSection: SectionDTO = { sectionName: result.value };
        this.adminService.updateSection(section._id, updatedSection).subscribe({
          next: () => {
            this.loadSections();
            Swal.fire('✅ Updated!', 'Section updated successfully!', 'success');
          },
          error: () => Swal.fire('❌ Error', 'Failed to update section.', 'error')
        });
      }
    });
  }

  deleteSection(id: string) {
    Swal.fire({
      title: 'Delete this section?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteSection(id).subscribe({
          next: () => {
            this.loadSections();
            this.modules = [];
            this.topics = [];
            this.contents = [];
            this.selectedSectionId = '';
            Swal.fire('Deleted!', 'Section has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Delete section error:', err);
            Swal.fire('❌ Error', 'Failed to delete section', 'error');
          }
        });
      }
    });
  }

  // ==============================
  // MODULE CRUD
  // ==============================
  onSectionChange(event: any) {
    this.selectedSectionId = event.target.value;
    this.selectedModuleId = '';
    this.selectedTopicId = '';
    this.modules = [];
    this.topics = [];
    this.contents = [];

    if (this.selectedSectionId) this.loadModulesBySection();
  }

  loadModulesBySection() {
    this.adminService.getModulesBySection(this.selectedSectionId).subscribe({
      next: (data: ModuleDTO[]) => (this.modules = data),
      error: (err) => console.error('Load modules error:', err)
    });
  }

  addModule(title: string) {
    if (!this.selectedSectionId) {
      Swal.fire('ℹ️ Select Section', 'Please select a section first.', 'info');
      return;
    }

    if (!title.trim()) {
      Swal.fire('⚠️ Required', 'Module title is required', 'warning');
      return;
    }

    const moduleData: ModuleDTO = { title };
    this.adminService.createModule(this.selectedSectionId, moduleData).subscribe({
      next: () => {
        this.loadModulesBySection();
        Swal.fire('✅ Success', 'Module added successfully!', 'success');
      },
      error: (err) => {
        console.error('Add module error:', err);
        Swal.fire('❌ Error', 'Failed to add module', 'error');
      }
    });
  }

  updateModule(module: ModuleDTO) {
    Swal.fire({
      title: 'Edit Module',
      input: 'text',
      inputValue: module.title,
      showCancelButton: true,
      confirmButtonText: 'Update'
    }).then((result) => {
      if (result.isConfirmed && module._id) {
        const updatedModule: ModuleDTO = { title: result.value };
        this.adminService.updateModule(module._id, updatedModule).subscribe({
          next: () => {
            this.loadModulesBySection();
            Swal.fire('✅ Updated!', 'Module updated successfully!', 'success');
          },
          error: () => Swal.fire('❌ Error', 'Failed to update module.', 'error')
        });
      }
    });
  }

  deleteModule(id: string) {
    Swal.fire({
      title: 'Delete this module?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteModule(id).subscribe({
          next: () => {
            this.loadModulesBySection();
            this.topics = [];
            this.contents = [];
            Swal.fire('Deleted!', 'Module has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Delete module error:', err);
            Swal.fire('❌ Error', 'Failed to delete module', 'error');
          }
        });
      }
    });
  }

  // ==============================
  // TOPIC CRUD
  // ==============================
  onModuleChange(event: any) {
    this.selectedModuleId = event.target.value;
    this.selectedTopicId = '';
    this.topics = [];
    this.contents = [];
    if (this.selectedModuleId) this.loadTopicsByModule();
  }

  loadTopicsByModule() {
    this.adminService.getTopicsByModule(this.selectedModuleId).subscribe({
      next: (data: TopicDTO[]) => (this.topics = data),
      error: (err) => console.error('Load topics error:', err)
    });
  }

  addTopic(topicName: string) {
    if (!this.selectedModuleId) {
      Swal.fire('ℹ️ Select Module', 'Please select a module first.', 'info');
      return;
    }

    if (!topicName.trim()) {
      Swal.fire('⚠️ Required', 'Topic name is required', 'warning');
      return;
    }

    const topicData: TopicDTO = { title: topicName };

    this.adminService.createTopic(this.selectedModuleId, topicData).subscribe({
      next: () => {
        this.loadTopicsByModule();
        Swal.fire('✅ Success', 'Topic added successfully!', 'success');
      },
      error: (err) => {
        console.error('Add topic error:', err);
        Swal.fire('❌ Error', 'Failed to add topic', 'error');
      }
    });
  }

  updateTopic(topic: TopicDTO) {
    Swal.fire({
      title: 'Edit Topic',
      input: 'text',
      inputValue: topic.title,
      showCancelButton: true,
      confirmButtonText: 'Update'
    }).then((result) => {
      if (result.isConfirmed && topic._id) {
        const updatedTopic: TopicDTO = { title: result.value };
        this.adminService.updateTopic(topic._id, updatedTopic).subscribe({
          next: () => {
            this.loadTopicsByModule();
            Swal.fire('✅ Updated!', 'Topic updated successfully!', 'success');
          },
          error: () => Swal.fire('❌ Error', 'Failed to update topic.', 'error')
        });
      }
    });
  }

  deleteTopic(id: string) {
    Swal.fire({
      title: 'Delete this topic?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteTopic(id).subscribe({
          next: () => {
            this.loadTopicsByModule();
            this.contents = [];
            Swal.fire('Deleted!', 'Topic has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Delete topic error:', err);
            Swal.fire('❌ Error', 'Failed to delete topic', 'error');
          }
        });
      }
    });
  }


  onTopicChange(event: any) {
    this.selectedTopicId = event.target.value;
    this.contents = [];
    if (this.selectedTopicId) this.loadContentsByTopic();
  }

  loadContentsByTopic() {
    this.adminService.getContentsByTopic(this.selectedTopicId).subscribe({
      next: (data: ContentDTO[]) => {
        console.log('getContentsByTopic:', data);
         this.contents = data
      },       
       
      error: (err) => console.error('Load contents error:', err)
    });
  }

  addContent(title: string, contentType: string, contentURL: string) {
    if (!this.selectedTopicId) {
      Swal.fire('ℹ️ Select Topic', 'Please select a topic first.', 'info');
      return;
    }

    if (!title.trim() || !contentType.trim() || !contentURL.trim()) {
      Swal.fire('⚠️ Required', 'All content fields are required', 'warning');
      return;
    }

    const contentData: ContentDTO = {
      contentName: title,
    contentType: contentType,
    contentUrl: contentURL
    };

    this.adminService.createContent(this.selectedTopicId, contentData).subscribe({
      next: () => {
        this.loadContentsByTopic();
        Swal.fire('✅ Success', 'Content added successfully!', 'success');
      },
      error: (err) => {
        console.error('Add content error:', err);
        Swal.fire('❌ Error', 'Failed to add content', 'error');
      }
    });
  }

  updateContent(content: ContentDTO) {
    Swal.fire({
      title: 'Edit Content',
      html: `
      <input id="title" class="swal2-input" placeholder="Title" value="${content.contentName || ''}">
      <input id="type" class="swal2-input" placeholder="Type" value="${content.contentType || ''}">
      <input id="url" class="swal2-input" placeholder="URL" value="${content.contentUrl || ''}">
    `,
      focusConfirm: false,
      preConfirm: () => {
        const title = (document.getElementById('title') as HTMLInputElement).value;
        const contentType = (document.getElementById('type') as HTMLInputElement).value;
        const contentURL = (document.getElementById('url') as HTMLInputElement).value;

        if (!title.trim() || !contentType.trim() || !contentURL.trim()) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }

        return { title, contentType, contentURL };
      }
    }).then((result) => {
      if (result.isConfirmed && content._id) {
        const updatedContent: ContentDTO = {
          contentName: result.value!.title,
          contentType: result.value!.contentType,
          contentUrl: result.value!.contentURL
        };
        this.adminService.updateContent(content._id, updatedContent).subscribe({
          next: () => {
            this.loadContentsByTopic();
            Swal.fire('✅ Updated!', 'Content updated successfully!', 'success');
          },
          error: () => Swal.fire('❌ Error', 'Failed to update content.', 'error')
        });
      }
    });
  }

  deleteContent(id: string) {
    Swal.fire({
      title: 'Delete this content?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteContent(id).subscribe({
          next: () => {
            this.loadContentsByTopic();
            Swal.fire('Deleted!', 'Content has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Delete content error:', err);
            Swal.fire('❌ Error', 'Failed to delete content', 'error');
          }
        });
      }
    });
  }



}
