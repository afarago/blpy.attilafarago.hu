import { Tab, Tooltip } from 'bootstrap';
import panzoom from 'panzoom';
import '../static/css/site.css';
import { GITHUB_VERSION } from './github_version';
import { convertFlipperProjectToPython, PyConverterOptions } from 'blocklypy';

function handleFileUpload(file: File) {
    file.arrayBuffer().then(async (input) => {
        const options = {
            debug: { showExplainingComments: true },
        } as PyConverterOptions;

        const retval = await convertFlipperProjectToPython(input, options);
        $('#preview-svg').html(retval?.svg ?? '');
        $('#preview-svg-map')
            .html(retval?.svg ?? '')
            .removeClass('d-none');
        $('#preview-pycode').html(retval?.pycode ?? '');

        $('#preview-pseudocode').html(retval?.plaincode ?? '');

        const slotid = retval.projectInfo?.slotIndex;
        const sloturl = `img/cat${slotid}.svg#dsmIcon`;
        $('#svg-program-use').attr('href', sloturl).attr('xlink:href', sloturl);

        $('#tab-dummy').addClass('d-none');
        $('#tabs-main').removeClass('d-none');
        updateMapVisibility();
    });
}

function updateMapVisibility() {
    const visible = $("a[data-bs-toggle='tab'].active").attr('id') !== 'svg-tab';
    $('#preview-svg-map').toggleClass('d-none', !visible);
}

$('.example-content-button').on('click', (event) => {
    const path = event.target.dataset.file;
    if (!path) {
        return;
    }

    fetch(path)
        .then(async (data) => {
            const data2 = await data.blob();
            const file = new File([data2], 'sample.llsp3');

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            ($('#file-selector').get(0) as HTMLInputElement).files = dataTransfer.files;
            handleFileUpload(file);
        })
        .catch((error: unknown) => {
            console.error('::ERROR::', error);
        });
});

$('#maincontainer').on({
    dragover: async (event) => {
        event.stopPropagation();
        event.preventDefault();
        $('#maincontainer').addClass('drop-active');
        if (event.originalEvent?.dataTransfer) {
            event.originalEvent.dataTransfer.dropEffect = 'copy';
        }
    },
    dragleave: (event) => {
        event.stopPropagation();
        event.preventDefault();
        $('#maincontainer').removeClass('drop-active');
    },
    drop: (event) => {
        event.stopPropagation();
        event.preventDefault();
        $('#maincontainer').removeClass('drop-active');

        if (event.originalEvent?.dataTransfer) {
            const fileList = event.originalEvent.dataTransfer.files;
            ($('#file-selector').get(0) as HTMLInputElement).files = fileList;
            handleFileUpload(fileList[0]);
        }
    },
});

// webpack replaces arrow function $(this) to $(_this), so keep normal function here
// eslint-disable-next-line prefer-arrow-callback
$('#file-selector').on('change', function (_event) {
    const target = $(this)[0] as HTMLInputElement;
    if (!target.files?.length) {
        return;
    }
    handleFileUpload(target.files[0]);
});

$('.copy-button').on('click', function (event) {
    event.stopPropagation();
    event.preventDefault();

    const copyButton = $(this);
    const dataTarget = copyButton.data('target');
    const dataSuccessMessage = copyButton.data('success-msg');
    const content = $('#' + dataTarget).text();
    navigator.clipboard.writeText(content);

    copyButton.addClass('success');
    copyButton.children().toggleClass('bi-clipboard-check bi-copy');
    const tooltip = new Tooltip(copyButton[0], {
        // NOTE: consider this as popper adds 68k
        title: dataSuccessMessage,
        trigger: 'manual',
    });
    tooltip.show();
    setTimeout(() => {
        copyButton.removeClass('success');
        copyButton.children().toggleClass('bi-clipboard-check bi-copy');
        tooltip.dispose();
    }, 2000);
});

$("a[data-bs-toggle='tab']").on('shown.bs.tab', (_) => {
    updateMapVisibility();
});

$('#preview-svg-map').on('click', (_) => {
    const tabTrigger = new Tab($('#svg-tab')[0]);
    tabTrigger.show();
});

$(() => {
    const previewSvg = $('#preview-svg');
    if (!previewSvg) {
        return;
    }

    new MutationObserver((_) => {
        panzoom($('#preview-svg svg')[0], { bounds: true });
        // instance.on('zoom', function (e) {
        //   console.log('Fired when `element` is zoomed', e);
        // });
    }).observe(previewSvg[0], {
        childList: true,
    });

    $('#github-sha').attr('title', GITHUB_VERSION);
});
