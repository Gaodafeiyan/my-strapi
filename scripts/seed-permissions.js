/**
 * 权限种子脚本
 * 程序化给 Authenticated 角色插入 WithdrawRequest 相关权限
 */

module.exports = async ({ strapi }) => {
  try {
    console.log('🌱 开始设置权限...');

    // 获取 Authenticated 角色
    const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'authenticated' }
    });

    if (!authenticatedRole) {
      console.log('❌ 未找到 Authenticated 角色');
      return;
    }

    // 获取 WithdrawRequest 权限
    const withdrawRequestPermissions = await strapi.query('plugin::users-permissions.permission').findMany({
      where: {
        action: {
          $in: [
            'api::withdraw-request.withdraw-request.create',
            'api::withdraw-request.withdraw-request.find',
            'api::withdraw-request.withdraw-request.findOne'
          ]
        }
      }
    });

    // 为每个权限创建角色-权限关联
    for (const permission of withdrawRequestPermissions) {
      const existingLink = await strapi.query('plugin::users-permissions.role').findOne({
        where: {
          id: authenticatedRole.id,
          permissions: {
            id: permission.id
          }
        }
      });

      if (!existingLink) {
        await strapi.query('plugin::users-permissions.role').update({
          where: { id: authenticatedRole.id },
          data: {
            permissions: {
              connect: [{ id: permission.id }]
            }
          }
        });
        console.log(`✅ 已添加权限: ${permission.action}`);
      } else {
        console.log(`ℹ️ 权限已存在: ${permission.action}`);
      }
    }

    console.log('🎉 权限设置完成！');
  } catch (error) {
    console.error('❌ 权限设置失败:', error);
  }
}; 