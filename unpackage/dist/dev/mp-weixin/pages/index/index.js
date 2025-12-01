"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      selectedProject: "",
      loading: false,
      projects: [
        { id: "1", name: "地铁18号线延伸工程", description: "线路全长25.3公里，设站15座" },
        { id: "2", name: "地铁18号线延伸工程", description: "二期规划，连接机场与市中心" },
        { id: "3", name: "地铁18号线延伸工程", description: "北延伸段，服务北部新城" },
        { id: "4", name: "地铁18号线延伸工程", description: "南延伸段，连接高铁站" },
        { id: "5", name: "地铁18号线延伸工程", description: "东延伸段，贯穿商务区" },
        { id: "6", name: "地铁18号线延伸工程", description: "西延伸段，服务科技园区" },
        { id: "7", name: "地铁18号线延伸工程", description: "支线工程，连接卫星城" },
        { id: "8", name: "地铁18号线延伸工程", description: "延长线，增加换乘站" }
      ]
    };
  },
  methods: {
    handleRadioChange(e) {
      this.selectedProject = e.detail.value;
      common_vendor.index.__f__("log", "at pages/index/index.vue:82", "选中的项目ID:", this.selectedProject);
      const selected = this.projects.find((p) => p.id === this.selectedProject);
      if (selected) {
        common_vendor.index.showToast({
          title: `已选择: ${selected.name}`,
          icon: "none"
        });
      }
    },
    loadProjectData() {
      if (this.loading)
        return;
      this.loading = true;
      setTimeout(() => {
        common_vendor.index.showToast({
          title: "项目数据加载完成",
          icon: "success"
        });
        this.loading = false;
      }, 1500);
    },
    // 获取选中的项目名称
    getSelectedProjectName() {
      const selected = this.projects.find((p) => p.id === this.selectedProject);
      return selected ? selected.name : "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.projects, (project, index, i0) => {
      return {
        a: project.id,
        b: $data.selectedProject === project.id,
        c: common_vendor.t(project.name),
        d: common_vendor.t(project.description),
        e: index
      };
    }),
    b: common_vendor.o((...args) => $options.handleRadioChange && $options.handleRadioChange(...args)),
    c: $data.projects.length === 0
  }, $data.projects.length === 0 ? {} : {}, {
    d: $data.loading
  }, $data.loading ? {} : {}, {
    e: !$data.loading
  }, !$data.loading ? {} : {}, {
    f: common_vendor.o((...args) => $options.loadProjectData && $options.loadProjectData(...args)),
    g: $data.loading,
    h: $data.selectedProject
  }, $data.selectedProject ? {
    i: common_vendor.t($options.getSelectedProjectName())
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
