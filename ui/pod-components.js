/**
 * Print-on-Demand Enhanced UI Components
 * JavaScript functionality for zero-cost premium features
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initTabs();
  initSidebar();
  initSortableTables();
  initTooltips();
  initAccordion();
  initWizard();
  initDropzone();
  initFilterGrid();
});

/**
 * Tab functionality
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.pod-tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get target tab
      const targetId = this.getAttribute('data-target');
      const targetPane = document.getElementById(targetId);
      
      if (!targetPane) return;
      
      // Get parent tabs container
      const tabsContainer = this.closest('.pod-tabs');
      
      // Deactivate all tabs in this container
      tabsContainer.querySelectorAll('.pod-tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      tabsContainer.querySelectorAll('.pod-tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });
      
      // Activate clicked tab
      this.classList.add('active');
      targetPane.classList.add('active');
    });
  });
}

/**
 * Sidebar functionality
 */
function initSidebar() {
  const toggleButtons = document.querySelectorAll('.pod-sidebar-toggle');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });
}

/**
 * Sortable tables
 */
function initSortableTables() {
  const sortableHeaders = document.querySelectorAll('.pod-sortable');
  
  sortableHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const table = this.closest('table');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const columnIndex = Array.from(this.parentNode.children).indexOf(this);
      const sortField = this.getAttribute('data-sort');
      
      // Toggle sort direction
      if (this.classList.contains('pod-sort-asc')) {
        this.classList.remove('pod-sort-asc');
        this.classList.add('pod-sort-desc');
      } else if (this.classList.contains('pod-sort-desc')) {
        this.classList.remove('pod-sort-desc');
        this.classList.add('pod-sort-asc');
      } else {
        // Remove sort classes from all headers
        table.querySelectorAll('.pod-sortable').forEach(h => {
          h.classList.remove('pod-sort-asc', 'pod-sort-desc');
        });
        
        this.classList.add('pod-sort-asc');
      }
      
      // Get sort direction
      const isAscending = this.classList.contains('pod-sort-asc');
      
      // Sort rows
      rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        // Check if values are numbers
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return isAscending ? aNum - bNum : bNum - aNum;
        }
        
        // Sort as strings
        return isAscending 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      });
      
      // Reorder rows in the table
      rows.forEach(row => {
        tbody.appendChild(row);
      });
    });
  });
}

/**
 * Tooltips and Popovers
 */
function initTooltips() {
  // Simple tooltips are CSS-only
  
  // Initialize popovers
  const popoverTriggers = document.querySelectorAll('[data-pod-popover-title]');
  
  popoverTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove any existing popovers
      document.querySelectorAll('.pod-popover').forEach(p => p.remove());
      
      // Create popover
      const popover = document.createElement('div');
      popover.className = 'pod-popover';
      
      // Add title
      const title = this.getAttribute('data-pod-popover-title');
      const content = this.getAttribute('data-pod-popover-content');
      
      popover.innerHTML = `
        <div class="pod-popover-arrow"></div>
        <div class="pod-popover-header">${title}</div>
        <div class="pod-popover-body">${content}</div>
      `;
      
      // Position popover
      document.body.appendChild(popover);
      
      const triggerRect = this.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      
      // Position below the trigger by default
      let top = triggerRect.bottom + window.scrollY + 10;
      let left = triggerRect.left + window.scrollX + (triggerRect.width / 2) - (popoverRect.width / 2);
      
      // Ensure popover stays within viewport
      if (left < 10) left = 10;
      if (left + popoverRect.width > window.innerWidth - 10) {
        left = window.innerWidth - popoverRect.width - 10;
      }
      
      popover.style.top = `${top}px`;
      popover.style.left = `${left}px`;
      
      // Position arrow
      const arrow = popover.querySelector('.pod-popover-arrow');
      arrow.style.left = `${triggerRect.left + (triggerRect.width / 2) - left}px`;
      
      // Show popover
      setTimeout(() => {
        popover.classList.add('show');
      }, 10);
      
      // Close on document click
      const closePopover = function(event) {
        if (!popover.contains(event.target) && event.target !== trigger) {
          popover.classList.remove('show');
          setTimeout(() => {
            popover.remove();
          }, 200);
          document.removeEventListener('click', closePopover);
        }
      };
      
      // Add delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', closePopover);
      }, 100);
    });
  });
}

/**
 * Accordion functionality
 */
function initAccordion() {
  const accordionHeaders = document.querySelectorAll('.pod-accordion-header');
  
  accordionHeaders.forEach(header => {
    // Set initial ARIA attributes
    header.setAttribute('aria-expanded', 'false');
    
    header.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      // Toggle expanded state
      this.setAttribute('aria-expanded', !isExpanded);
    });
  });
}

/**
 * Form Wizard
 */
function initWizard() {
  const wizards = document.querySelectorAll('.pod-wizard');
  
  wizards.forEach(wizard => {
    const steps = Array.from(wizard.querySelectorAll('.pod-wizard-step'));
    const contents = Array.from(wizard.querySelectorAll('.pod-wizard-content > div'));
    const prevBtn = wizard.querySelector('.pod-wizard-actions button:first-child');
    const nextBtn = wizard.querySelector('.pod-wizard-actions button:last-child');
    
    let currentStep = 0;
    
    // Initialize
    updateWizardState();
    
    // Next button click
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (currentStep < steps.length - 1) {
          currentStep++;
          updateWizardState();
        }
      });
    }
    
    // Previous button click
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (currentStep > 0) {
          currentStep--;
          updateWizardState();
        }
      });
    }
    
    // Update wizard state based on current step
    function updateWizardState() {
      // Update steps
      steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        
        if (index === currentStep) {
          step.classList.add('active');
        } else if (index < currentStep) {
          step.classList.add('completed');
        }
      });
      
      // Update content visibility
      contents.forEach((content, index) => {
        content.style.display = index === currentStep ? 'block' : 'none';
      });
      
      // Update buttons
      if (prevBtn) {
        prevBtn.disabled = currentStep === 0;
      }
      
      if (nextBtn) {
        if (currentStep === steps.length - 1) {
          nextBtn.textContent = 'Finish';
        } else {
          nextBtn.textContent = 'Next';
        }
      }
    }
  });
}

/**
 * Drag and Drop File Upload
 */
function initDropzone() {
  const dropzones = document.querySelectorAll('.pod-dropzone');
  
  dropzones.forEach(dropzone => {
    const input = dropzone.querySelector('.pod-dropzone-input');
    const preview = dropzone.querySelector('.pod-dropzone-preview');
    
    if (!input) return;
    
    // Handle file selection via input
    input.addEventListener('change', function() {
      handleFiles(this.files);
    });
    
    // Handle drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Handle drag enter/over
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, function() {
        dropzone.classList.add('pod-dropzone-drag');
      }, false);
    });
    
    // Handle drag leave/drop
    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, function() {
        dropzone.classList.remove('pod-dropzone-drag');
      }, false);
    });
    
    // Handle drop
    dropzone.addEventListener('drop', function(e) {
      const files = e.dataTransfer.files;
      handleFiles(files);
    }, false);
    
    // Process the files
    function handleFiles(files) {
      if (!preview) return;
      
      // Clear preview
      preview.innerHTML = '';
      
      // Create preview items
      Array.from(files).forEach(file => {
        // Create preview item
        const item = document.createElement('div');
        item.className = 'pod-dropzone-file';
        
        // Add file info
        const fileSize = formatFileSize(file.size);
        item.innerHTML = `
          <div class="pod-dropzone-file-icon">📄</div>
          <div class="pod-dropzone-file-info">
            <div class="pod-dropzone-file-name">${file.name}</div>
            <div class="pod-dropzone-file-size">${fileSize}</div>
          </div>
          <button class="pod-dropzone-file-remove" aria-label="Remove file">×</button>
        `;
        
        // Add remove button functionality
        const removeBtn = item.querySelector('.pod-dropzone-file-remove');
        removeBtn.addEventListener('click', function() {
          item.remove();
        });
        
        // Add preview to container
        preview.appendChild(item);
      });
    }
    
    // Format file size
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  });
}

/**
 * Filterable Card Grid
 */
function initFilterGrid() {
  const filterButtons = document.querySelectorAll('.pod-filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get filter value
      const filterValue = this.getAttribute('data-filter');
      
      // Get parent toolbar
      const toolbar = this.closest('.pod-filter-toolbar');
      if (!toolbar) return;
      
      // Get target grid
      const grid = document.querySelector('.pod-card-grid');
      if (!grid) return;
      
      // Update active button
      toolbar.querySelectorAll('.pod-filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      this.classList.add('active');
      
      // Filter cards
      const cards = grid.querySelectorAll('.pod-card');
      
      cards.forEach(card => {
        if (filterValue === 'all') {
          card.style.display = '';
        } else {
          const cardCategory = card.getAttribute('data-category');
          card.style.display = cardCategory === filterValue ? '' : 'none';
        }
      });
    });
  });
}